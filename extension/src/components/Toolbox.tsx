import {
    Activity,
    Check,
    Copy,
    Monitor,
    RefreshCw,
    Settings,
    Square,
    Users,
    Volume2,
    VolumeX,
    Wifi,
    WifiOff,
} from "lucide-react";
import Peer, { type DataConnection, type MediaConnection } from "peerjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { APP_URL } from "@/constants";

const VIEWER_BASE_URL = APP_URL; // Changed to production URL when deployed

type Quality = "1080p" | "720p" | "480p" | "360p";
type StreamState = "idle" | "requesting" | "live" | "stopped" | "error";

const QUALITY_SETTINGS: Record<
    Quality,
    { width: number; height: number; frameRate: number; maxBitrate: number }
> = {
    "1080p": { width: 1920, height: 1080, frameRate: 30, maxBitrate: 8_000_000 },
    "720p": { width: 1280, height: 720, frameRate: 30, maxBitrate: 4_000_000 },
    "480p": { width: 854, height: 480, frameRate: 24, maxBitrate: 1_500_000 },
    "360p": { width: 640, height: 360, frameRate: 20, maxBitrate: 600_000 },
};

/** Create a silent audio track using the Web Audio API as a placeholder.
 *  This guarantees WebRTC always negotiates an audio m-line so that
 *  replaceTrack() works when real system audio becomes available later. */
function createSilentAudioTrack(): MediaStreamTrack {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = ctx.createMediaStreamDestination();
    oscillator.connect(dst);
    oscillator.start();
    const track = dst.stream.getAudioTracks()[0];
    // Mute it - volume is 0 by default from an unconnected oscillator destination
    track.enabled = false;
    return track;
}

export default function Toolbox() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [streamState, setStreamState] = useState<StreamState>("idle");
    const [quality, setQuality] = useState<Quality>("720p");
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [viewerCount, setViewerCount] = useState(0);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");
    const [shareUrl, setShareUrl] = useState("");
    const [peerReady, setPeerReady] = useState(false);

    const peerRef = useRef<Peer | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    // The composed stream we send to peers - always has both video + audio track
    const outStreamRef = useRef<MediaStream | null>(null);
    const silentTrackRef = useRef<MediaStreamTrack | null>(null);
    const mediaCallsRef = useRef<Map<string, MediaConnection>>(new Map());
    const dataConnsRef = useRef<Map<string, DataConnection>>(new Map());
    const previewRef = useRef<HTMLVideoElement>(null);
    const qualityRef = useRef<Quality>("720p");

    useEffect(() => {
        qualityRef.current = quality;
    }, [quality]);

    useEffect(() => {
        chrome.runtime.sendMessage({ type: "GET_SESSION" }, (res) => {
            if (res?.sessionId) {
                setSessionId(res.sessionId);
                setShareUrl(`${VIEWER_BASE_URL}/watch/${res.sessionId}`);
            }
        });
    }, []);

    // ─── Apply adaptive bitrate to a single video sender ──────────────────────
    const applyBitrateToSender = useCallback(async (sender: RTCRtpSender, q: Quality) => {
        const { maxBitrate } = QUALITY_SETTINGS[q];
        try {
            const params = sender.getParameters();
            if (!params.encodings || params.encodings.length === 0) params.encodings = [{}];
            params.encodings = params.encodings.map((enc) => ({
                ...enc,
                maxBitrate,
                scaleResolutionDownBy: 1,
                networkPriority: "high" as RTCPriorityType,
                priority: "high" as RTCPriorityType,
            }));
            await sender.setParameters(params);
        } catch {
            /* silently ignore - not supported everywhere */
        }
    }, []);

    // ─── Apply bitrate cap to ALL active calls ─────────────────────────────────
    const applyBitrateToAllCalls = useCallback(
        async (q: Quality) => {
            for (const call of mediaCallsRef.current.values()) {
                const pc: RTCPeerConnection = call.peerConnection;
                if (!pc) continue;
                for (const sender of pc.getSenders()) {
                    if (sender.track?.kind === "video") await applyBitrateToSender(sender, q);
                }
            }
        },
        [applyBitrateToSender],
    );

    // ─── Replace a specific track kind on ALL active calls ────────────────────
    const replaceTrackOnAllCalls = useCallback(async (newTrack: MediaStreamTrack) => {
        const kind = newTrack.kind; // "video" or "audio"
        const promises: Promise<void>[] = [];
        for (const call of mediaCallsRef.current.values()) {
            const pc: RTCPeerConnection = call.peerConnection;
            if (!pc) continue;
            for (const sender of pc.getSenders()) {
                if (sender.track?.kind === kind || (sender.track?.kind ?? kind) === kind) {
                    // Match by kind - also handles the case where current track is the silent placeholder
                    if (sender.track?.kind === kind) {
                        promises.push(sender.replaceTrack(newTrack));
                    }
                }
            }
        }
        await Promise.all(promises);
    }, []);

    // ─── Build the outgoing stream (video + guaranteed audio track) ────────────
    const buildOutStream = useCallback((displayStream: MediaStream): MediaStream => {
        const videoTrack = displayStream.getVideoTracks()[0];
        const audioTracks = displayStream.getAudioTracks();

        let audioTrack: MediaStreamTrack;
        if (audioTracks.length > 0) {
            // Real system audio captured
            audioTrack = audioTracks[0];
            if (silentTrackRef.current) {
                silentTrackRef.current.stop();
                silentTrackRef.current = null;
            }
        } else {
            // No system audio - insert a silent placeholder so WebRTC negotiates audio
            const silent = createSilentAudioTrack();
            silentTrackRef.current = silent;
            audioTrack = silent;
        }

        const out = new MediaStream([videoTrack, audioTrack]);
        outStreamRef.current = out;
        return out;
    }, []);

    // ─── Call a viewer - broadcaster → viewer ─────────────────────────────────
    const callViewer = useCallback(
        (viewerId: string) => {
            const peer = peerRef.current;
            const outStream = outStreamRef.current;
            if (!peer || !outStream) return;

            const call = peer.call(viewerId, outStream);
            mediaCallsRef.current.set(viewerId, call);
            setViewerCount((c) => c + 1);

            call.on("stream", () => {
                setTimeout(() => applyBitrateToAllCalls(qualityRef.current), 1000);
            });
            call.on("close", () => {
                mediaCallsRef.current.delete(viewerId);
                setViewerCount((c) => Math.max(0, c - 1));
            });
            call.on("error", () => {
                mediaCallsRef.current.delete(viewerId);
                setViewerCount((c) => Math.max(0, c - 1));
            });
        },
        [applyBitrateToAllCalls],
    );

    // ─── Peer setup ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (!sessionId) return;

        const abortController = new AbortController();

        const initPeer = async () => {
            let iceServers: RTCIceServer[] = [];
            try {
                const res = await fetch(`${APP_URL}/api/turn`, {
                    signal: abortController.signal,
                });
                const creds = await res.json();
                iceServers = creds.iceServers;
            } catch (err: unknown) {
                if (err instanceof Error && err.name === "AbortError") return;
                console.error("Failed to fetch ICE servers:", err);
            }

            if (abortController.signal.aborted) return;

            const peer = new Peer(`oculus-host-${sessionId}`, {
                debug: 2,
                config: {
                    iceServers,
                    iceCandidatePoolSize: 10,
                },
            });

            peerRef.current = peer;

            peer.on("open", () => {
                setPeerReady(true);
                startCapture();
            });

            peer.on("connection", (dataConn) => {
                const viewerId = dataConn.peer;
                dataConnsRef.current.set(viewerId, dataConn);

                dataConn.on("open", () => {
                    if (outStreamRef.current) callViewer(viewerId);
                });
                dataConn.on("close", () => dataConnsRef.current.delete(viewerId));
                dataConn.on("error", () => dataConnsRef.current.delete(viewerId));
            });

            peer.on("error", (err) => {
                console.error("Peer error:", err);
                setError(`Connection error: ${err.message}`);
                setStreamState("error");
            });
        };

        initPeer();

        return () => {
            abortController.abort();
            peerRef.current?.destroy();
            streamRef.current?.getTracks().forEach((t) => {
                t.stop();
            });
            silentTrackRef.current?.stop();
        };
    }, [sessionId]);

    // ─── Capture screen ───────────────────────────────────────────────────────
    const startCapture = useCallback(
        async (isReplace = false) => {
            if (!isReplace) setStreamState("requesting");
            setError("");

            const q = QUALITY_SETTINGS[qualityRef.current];

            try {
                const displayStream = await navigator.mediaDevices.getDisplayMedia({
                    video: {
                        width: { ideal: q.width },
                        height: { ideal: q.height },
                        frameRate: { ideal: q.frameRate },
                    },
                    audio: {
                        echoCancellation: false,
                        noiseSuppression: false,
                        sampleRate: 44100,
                    },
                });

                const newVideoTrack = displayStream.getVideoTracks()[0];
                const newAudioTracks = displayStream.getAudioTracks();
                const hasRealAudio = newAudioTracks.length > 0;

                if (isReplace && outStreamRef.current) {
                    // ── Replace video track on all active peer connections ───────────────
                    await replaceTrackOnAllCalls(newVideoTrack);

                    // ── Replace audio track on all active peer connections ───────────────
                    let newAudioTrack: MediaStreamTrack;
                    if (hasRealAudio) {
                        newAudioTrack = newAudioTracks[0];
                        // Replace the silent placeholder or old audio with real audio
                        await replaceTrackOnAllCalls(newAudioTrack);
                        if (silentTrackRef.current) {
                            silentTrackRef.current.stop();
                            silentTrackRef.current = null;
                        }
                    } else {
                        // No audio selected - insert a fresh silent track
                        const silent = createSilentAudioTrack();
                        silentTrackRef.current = silent;
                        newAudioTrack = silent;
                        await replaceTrackOnAllCalls(newAudioTrack);
                    }

                    // Stop old tracks from the previous display stream
                    streamRef.current?.getTracks().forEach((t) => {
                        t.stop();
                    });

                    // Update refs
                    streamRef.current = displayStream;
                    const newOut = new MediaStream([newVideoTrack, newAudioTrack]);
                    outStreamRef.current = newOut;
                } else {
                    streamRef.current = displayStream;
                    buildOutStream(displayStream);
                }

                // Update local preview (show raw display stream)
                if (previewRef.current) {
                    previewRef.current.srcObject = displayStream;
                }

                setAudioEnabled(hasRealAudio);
                setStreamState("live");

                // Apply adaptive bitrate
                await applyBitrateToAllCalls(qualityRef.current);

                // Handle native browser "Stop sharing" button
                newVideoTrack.addEventListener("ended", () => stopStream());

                // If initial capture, call any viewers already waiting
                if (!isReplace) {
                    dataConnsRef.current.forEach((_dc, viewerId) => {
                        if (!mediaCallsRef.current.has(viewerId)) callViewer(viewerId);
                    });
                }
            } catch {
                if (!isReplace) {
                    setError("Screen capture was denied or cancelled.");
                    setStreamState("error");
                }
            }
        },
        [applyBitrateToAllCalls, replaceTrackOnAllCalls, buildOutStream, callViewer],
    );

    // ─── Stop stream ──────────────────────────────────────────────────────────
    const stopStream = useCallback(() => {
        streamRef.current?.getTracks().forEach((t) => {
            t.stop();
        });
        silentTrackRef.current?.stop();
        streamRef.current = null;
        outStreamRef.current = null;
        mediaCallsRef.current.forEach((call) => {
            call.close();
        });
        mediaCallsRef.current.clear();
        dataConnsRef.current.forEach((dc) => {
            dc.close();
        });
        dataConnsRef.current.clear();
        setViewerCount(0);
        setStreamState("stopped");
        peerRef.current?.destroy();
        chrome.runtime.sendMessage({ type: "STOP_BROADCAST" });
        setTimeout(() => window.close(), 1500);
    }, []);

    // ─── Change quality ───────────────────────────────────────────────────────
    const changeQuality = useCallback(
        async (newQuality: Quality) => {
            setQuality(newQuality);
            qualityRef.current = newQuality;
            if (streamState !== "live" || !streamRef.current) return;

            const q = QUALITY_SETTINGS[newQuality];
            const videoTrack = streamRef.current.getVideoTracks()[0];

            if (videoTrack) {
                try {
                    await videoTrack.applyConstraints({
                        width: { ideal: q.width },
                        height: { ideal: q.height },
                        frameRate: { ideal: q.frameRate },
                    });
                } catch {
                    /* applyConstraints not supported on all display tracks */
                }
            }

            await applyBitrateToAllCalls(newQuality);
        },
        [streamState, applyBitrateToAllCalls],
    );

    // ─── Toggle system audio (mute/unmute the audio track) ────────────────────
    const toggleAudio = useCallback(() => {
        if (!outStreamRef.current) return;
        const audioTracks = outStreamRef.current.getAudioTracks();

        if (audioTracks.length === 0 || silentTrackRef.current) {
            // Only silent placeholder - can't enable real audio without re-sharing
            setError(
                "No tab audio captured. Re-share your screen and enable 'Also share tab audio'.",
            );
            return;
        }

        const next = !audioEnabled;
        audioTracks.forEach((t) => {
            t.enabled = next;
        });
        setAudioEnabled(next);
        setError("");
    }, [audioEnabled]);

    const copyUrl = async () => {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const statusColor = {
        idle: "bg-zinc-600",
        requesting: "bg-yellow-500 animate-pulse",
        live: "bg-red-500 animate-pulse",
        stopped: "bg-zinc-600",
        error: "bg-red-700",
    }[streamState];

    const statusLabel = {
        idle: "Idle",
        requesting: "Requesting...",
        live: "LIVE",
        stopped: "Stopped",
        error: "Error",
    }[streamState];

    return (
        <div className="min-h-screen bg-black text-gray-100 font-sans flex flex-col">
            {/* Top Bar */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07] bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                        <Monitor className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white tracking-wide">Oculus</h1>
                        <p className="text-xs text-zinc-500">Broadcaster Control</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/4 border border-white/8">
                        <span className={`w-2 h-2 rounded-full ${statusColor}`} />
                        <span className="text-xs font-medium text-zinc-300">{statusLabel}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/4 border border-white/8">
                        <Users className="w-3.5 h-3.5 text-brand-400" />
                        <span className="text-xs font-medium text-zinc-300">{viewerCount}</span>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 gap-6 p-6 max-w-5xl mx-auto w-full">
                {/* Preview */}
                <div className="flex-1 flex flex-col gap-4">
                    <div className="relative rounded-2xl overflow-hidden bg-zinc-950 border border-white/[0.07] aspect-video">
                        <video
                            ref={previewRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-contain"
                        />
                        {streamState !== "live" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center">
                                    <Monitor className="w-8 h-8 text-zinc-600" />
                                </div>
                                <p className="text-sm text-zinc-500 text-center px-4">
                                    {streamState === "requesting"
                                        ? "Waiting for screen selection..."
                                        : streamState === "stopped"
                                          ? "Stream ended"
                                          : streamState === "error"
                                            ? error
                                            : "No preview available"}
                                </p>
                                {streamState === "error" && (
                                    <button
                                        type="button"
                                        onClick={() => startCapture(false)}
                                        className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-colors"
                                    >
                                        Retry Capture
                                    </button>
                                )}
                            </div>
                        )}
                        {streamState === "live" && (
                            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/90 backdrop-blur-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                <span className="text-xs font-bold text-white">LIVE</span>
                            </div>
                        )}
                        <div className="absolute top-3 right-3">
                            {peerReady ? (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/10 backdrop-blur-sm border border-brand-500/20">
                                    <Wifi className="w-3 h-3 text-brand-400" />
                                    <span className="text-xs text-brand-400">Ready</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/6 backdrop-blur-sm border border-white/8">
                                    <WifiOff className="w-3 h-3 text-zinc-500" />
                                    <span className="text-xs text-zinc-500">Connecting...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs">
                            <span className="mt-0.5">⚠</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {shareUrl && (
                        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/3 border border-white/[0.07]">
                            <span className="flex-1 text-xs text-zinc-400 truncate font-mono">
                                {shareUrl}
                            </span>
                            <button
                                type="button"
                                onClick={copyUrl}
                                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-colors"
                            >
                                {copied ? (
                                    <Check className="w-3.5 h-3.5" />
                                ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                )}
                                {copied ? "Copied!" : "Copy Link"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Controls Panel */}
                <div className="w-64 flex flex-col gap-4">
                    {/* Quality */}
                    <div className="rounded-2xl bg-zinc-950 border border-white/[0.07] p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4 text-brand-400" />
                            <h3 className="text-sm font-semibold text-white">Quality</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {(["1080p", "720p", "480p", "360p"] as Quality[]).map((q) => (
                                <button
                                    type="button"
                                    key={q}
                                    onClick={() => changeQuality(q)}
                                    disabled={streamState !== "live" && streamState !== "idle"}
                                    className={`py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                                        quality === q
                                            ? "bg-brand-600 text-white shadow-lg shadow-brand-900/30"
                                            : "bg-white/4 border border-white/8 text-zinc-400 hover:bg-white/8 hover:text-white"
                                    }`}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-1.5 pt-1">
                            <Activity className="w-3 h-3 text-zinc-600" />
                            <p className="text-[10px] text-zinc-600">
                                Adaptive bitrate · up to{" "}
                                {
                                    { "1080p": "8", "720p": "4", "480p": "1.5", "360p": "0.6" }[
                                        quality
                                    ]
                                }{" "}
                                Mbps
                            </p>
                        </div>
                    </div>

                    {/* Tab Audio */}
                    <div className="rounded-2xl bg-zinc-950 border border-white/[0.07] p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            {audioEnabled ? (
                                <Volume2 className="w-4 h-4 text-brand-400" />
                            ) : (
                                <VolumeX className="w-4 h-4 text-zinc-500" />
                            )}
                            <h3 className="text-sm font-semibold text-white">Tab Audio</h3>
                        </div>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            {audioEnabled
                                ? "Tab audio is live - viewers can hear it."
                                : silentTrackRef.current
                                  ? "No tab audio captured. Re-share screen & enable 'Also share tab audio'."
                                  : "No audio source active."}
                        </p>
                        <button
                            type="button"
                            onClick={toggleAudio}
                            disabled={!outStreamRef.current || !!silentTrackRef.current}
                            className={`w-full py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                                audioEnabled
                                    ? "bg-brand-600/20 border border-brand-500/30 text-brand-300 hover:bg-brand-600/30"
                                    : "bg-white/4 border border-white/8 text-zinc-400 hover:bg-white/8 hover:text-white"
                            }`}
                        >
                            {audioEnabled ? "Mute Audio" : "Unmute Audio"}
                        </button>
                        <div className="text-[10px] text-zinc-700 leading-relaxed space-y-1">
                            <p>
                                Enable &quot;Also share tab audio&quot; in the browser screen picker
                                to share tab sound.
                            </p>
                            <p className="text-yellow-500/80">
                                Note: Audio sharing only works while sharing browser tabs.
                            </p>
                        </div>
                    </div>

                    {/* Viewer Count */}
                    <div className="rounded-2xl bg-zinc-950 border border-white/[0.07] p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-brand-400" />
                                <span className="text-sm font-semibold text-white">Viewers</span>
                            </div>
                            <span className="text-2xl font-bold text-white">{viewerCount}</span>
                        </div>
                        <p className="text-xs text-zinc-600 mt-1">Active connections</p>
                    </div>

                    {/* Change Screen */}
                    {streamState === "live" && (
                        <button
                            type="button"
                            onClick={() => startCapture(true)}
                            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-white/4 border border-white/8 hover:bg-white/[0.07] text-zinc-300 text-xs font-medium transition-colors"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Change Screen / Window
                        </button>
                    )}

                    {/* Stop Button */}
                    <button
                        type="button"
                        onClick={stopStream}
                        disabled={streamState === "stopped"}
                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Square className="w-4 h-4 fill-red-400" />
                        Stop Broadcasting
                    </button>
                </div>
            </div>
        </div>
    );
}
