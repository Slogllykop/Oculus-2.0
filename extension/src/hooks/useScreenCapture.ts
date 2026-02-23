import type { DataConnection, MediaConnection } from "peerjs";
import { useCallback, useRef, useState } from "react";
import { QUALITY_SETTINGS } from "@/constants";
import type { Quality, StreamState } from "@/types";

/** Create a silent audio track as a placeholder for WebRTC audio negotiation. */
function createSilentAudioTrack(): MediaStreamTrack {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const dst = ctx.createMediaStreamDestination();
    oscillator.connect(dst);
    oscillator.start();
    const track = dst.stream.getAudioTracks()[0];
    track.enabled = false;
    return track;
}

interface UseScreenCaptureOptions {
    qualityRef: React.RefObject<Quality>;
    outStreamRef: React.RefObject<MediaStream | null>;
    mediaCallsRef: React.RefObject<Map<string, MediaConnection>>;
    dataConnsRef: React.RefObject<Map<string, DataConnection>>;
    applyBitrateToAllCalls: (q: Quality) => Promise<void>;
    replaceTrackOnAllCalls: (newTrack: MediaStreamTrack) => Promise<void>;
    callViewer: (viewerId: string) => void;
    destroyPeer: () => void;
    resetViewerCount: () => void;
}

interface UseScreenCaptureReturn {
    streamState: StreamState;
    audioEnabled: boolean;
    error: string;
    previewRef: React.RefObject<HTMLVideoElement | null>;
    silentTrackRef: React.RefObject<MediaStreamTrack | null>;
    startCapture: (isReplace?: boolean) => Promise<void>;
    stopStream: () => void;
    changeQuality: (q: Quality) => Promise<void>;
    toggleAudio: () => void;
    quality: Quality;
}

/**
 * Manages screen capture lifecycle:
 * - getDisplayMedia with quality constraints
 * - Silent audio placeholder creation
 * - Stream building (video + audio)
 * - Quality change with constraint re-application
 * - Audio toggle (mute/unmute real audio track)
 * - Stop stream and full cleanup
 */
export function useScreenCapture({
    qualityRef,
    outStreamRef,
    mediaCallsRef,
    dataConnsRef,
    applyBitrateToAllCalls,
    replaceTrackOnAllCalls,
    callViewer,
    destroyPeer,
    resetViewerCount,
}: UseScreenCaptureOptions): UseScreenCaptureReturn {
    const [streamState, setStreamState] = useState<StreamState>("idle");
    const [quality, setQuality] = useState<Quality>("720p");
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [error, setError] = useState("");

    const streamRef = useRef<MediaStream | null>(null);
    const silentTrackRef = useRef<MediaStreamTrack | null>(null);
    const previewRef = useRef<HTMLVideoElement | null>(null);

    // ─── Build composed outgoing stream ────────────────────────────────────────
    const buildOutStream = useCallback(
        (displayStream: MediaStream): MediaStream => {
            const videoTrack = displayStream.getVideoTracks()[0];
            const audioTracks = displayStream.getAudioTracks();

            let audioTrack: MediaStreamTrack;
            if (audioTracks.length > 0) {
                audioTrack = audioTracks[0];
                if (silentTrackRef.current) {
                    silentTrackRef.current.stop();
                    silentTrackRef.current = null;
                }
            } else {
                const silent = createSilentAudioTrack();
                silentTrackRef.current = silent;
                audioTrack = silent;
            }

            const out = new MediaStream([videoTrack, audioTrack]);
            (outStreamRef as React.RefObject<MediaStream | null>).current = out;
            return out;
        },
        [outStreamRef],
    );

    // ─── Stop stream ──────────────────────────────────────────────────────────
    const stopStream = useCallback(() => {
        streamRef.current?.getTracks().forEach((t) => {
            t.stop();
        });
        silentTrackRef.current?.stop();
        streamRef.current = null;
        (outStreamRef as React.RefObject<MediaStream | null>).current = null;

        mediaCallsRef.current.forEach((call) => {
            call.close();
        });
        mediaCallsRef.current.clear();
        dataConnsRef.current.forEach((dc) => {
            dc.close();
        });
        dataConnsRef.current.clear();

        resetViewerCount();
        setStreamState("stopped");
        destroyPeer();
        chrome.runtime.sendMessage({ type: "STOP_BROADCAST" });
        setTimeout(() => window.close(), 1500);
    }, [outStreamRef, mediaCallsRef, dataConnsRef, destroyPeer, resetViewerCount]);

    // ─── Start / replace screen capture ───────────────────────────────────────
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
                    await replaceTrackOnAllCalls(newVideoTrack);

                    let newAudioTrack: MediaStreamTrack;
                    if (hasRealAudio) {
                        newAudioTrack = newAudioTracks[0];
                        await replaceTrackOnAllCalls(newAudioTrack);
                        if (silentTrackRef.current) {
                            silentTrackRef.current.stop();
                            silentTrackRef.current = null;
                        }
                    } else {
                        const silent = createSilentAudioTrack();
                        silentTrackRef.current = silent;
                        newAudioTrack = silent;
                        await replaceTrackOnAllCalls(newAudioTrack);
                    }

                    streamRef.current?.getTracks().forEach((t) => {
                        t.stop();
                    });
                    streamRef.current = displayStream;
                    const newOut = new MediaStream([newVideoTrack, newAudioTrack]);
                    (outStreamRef as React.RefObject<MediaStream | null>).current = newOut;
                } else {
                    streamRef.current = displayStream;
                    buildOutStream(displayStream);
                }

                if (previewRef.current) {
                    previewRef.current.srcObject = displayStream;
                }

                setAudioEnabled(hasRealAudio);
                setStreamState("live");
                await applyBitrateToAllCalls(qualityRef.current);

                newVideoTrack.addEventListener("ended", () => stopStream());

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
        [
            qualityRef,
            outStreamRef,
            mediaCallsRef,
            dataConnsRef,
            applyBitrateToAllCalls,
            replaceTrackOnAllCalls,
            buildOutStream,
            callViewer,
            stopStream,
        ],
    );

    // ─── Change quality ───────────────────────────────────────────────────────
    const changeQuality = useCallback(
        async (newQuality: Quality) => {
            setQuality(newQuality);
            (qualityRef as React.RefObject<Quality>).current = newQuality;
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
        [streamState, qualityRef, applyBitrateToAllCalls],
    );

    // ─── Toggle audio ─────────────────────────────────────────────────────────
    const toggleAudio = useCallback(() => {
        if (!outStreamRef.current) return;
        const audioTracks = outStreamRef.current.getAudioTracks();

        if (audioTracks.length === 0 || silentTrackRef.current) {
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
    }, [audioEnabled, outStreamRef]);

    return {
        streamState,
        audioEnabled,
        error,
        previewRef,
        silentTrackRef,
        startCapture,
        stopStream,
        changeQuality,
        toggleAudio,
        quality,
    };
}
