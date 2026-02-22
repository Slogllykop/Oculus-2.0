import { useEffect, useRef, useState, useCallback } from "react";
import Peer, { DataConnection, MediaConnection } from "peerjs";
import {
  Monitor,
  Volume2,
  VolumeX,
  Square,
  Settings,
  Users,
  Wifi,
  WifiOff,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";

const VIEWER_BASE_URL = "http://localhost:3000"; // Change to production URL when deployed

type Quality = "1080p" | "720p" | "480p" | "360p";
type StreamState = "idle" | "requesting" | "live" | "stopped" | "error";

const QUALITY_SETTINGS: Record<Quality, { width: number; height: number; frameRate: number }> = {
  "1080p": { width: 1920, height: 1080, frameRate: 30 },
  "720p": { width: 1280, height: 720, frameRate: 30 },
  "480p": { width: 854, height: 480, frameRate: 24 },
  "360p": { width: 640, height: 360, frameRate: 20 },
};

export default function Toolbox() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [streamState, setStreamState] = useState<StreamState>("idle");
  const [quality, setQuality] = useState<Quality>("720p");
  // audioEnabled = display/system audio is included in the stream
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [peerReady, setPeerReady] = useState(false);

  const peerRef = useRef<Peer | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  // Map of viewerPeerId -> MediaConnection (outgoing call to viewer)
  const mediaCallsRef = useRef<Map<string, MediaConnection>>(new Map());
  // Map of viewerPeerId -> DataConnection (viewer announcement channel)
  const dataConnsRef = useRef<Map<string, DataConnection>>(new Map());
  const previewRef = useRef<HTMLVideoElement>(null);

  // Get session from background
  useEffect(() => {
    chrome.runtime.sendMessage({ type: "GET_SESSION" }, (res) => {
      if (res?.sessionId) {
        setSessionId(res.sessionId);
        setShareUrl(`${VIEWER_BASE_URL}/watch/${res.sessionId}`);
      }
    });
  }, []);

  // Initialize PeerJS once we have a sessionId
  useEffect(() => {
    if (!sessionId) return;

    const peer = new Peer(`oculus-host-${sessionId}`, {
      host: "0.peerjs.com",
      port: 443,
      secure: true,
      path: "/",
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:global.stun.twilio.com:3478" },
        ],
      },
    });

    peerRef.current = peer;

    peer.on("open", () => {
      setPeerReady(true);
      startCapture();
    });

    // Viewers announce themselves via a data connection
    peer.on("connection", (dataConn) => {
      const viewerId = dataConn.peer;
      dataConnsRef.current.set(viewerId, dataConn);

      dataConn.on("open", () => {
        // Broadcaster calls the viewer with the current stream
        if (streamRef.current) {
          callViewer(viewerId);
        }
      });

      dataConn.on("close", () => {
        dataConnsRef.current.delete(viewerId);
        // The media call close event handles viewer count
      });

      dataConn.on("error", () => {
        dataConnsRef.current.delete(viewerId);
      });
    });

    peer.on("error", (err) => {
      console.error("Peer error:", err);
      setError(`Connection error: ${err.message}`);
      setStreamState("error");
    });

    return () => {
      peer.destroy();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const callViewer = useCallback((viewerId: string) => {
    const peer = peerRef.current;
    const stream = streamRef.current;
    if (!peer || !stream) return;

    const call = peer.call(viewerId, stream);
    mediaCallsRef.current.set(viewerId, call);
    setViewerCount((c) => c + 1);

    call.on("close", () => {
      mediaCallsRef.current.delete(viewerId);
      setViewerCount((c) => Math.max(0, c - 1));
    });

    call.on("error", () => {
      mediaCallsRef.current.delete(viewerId);
      setViewerCount((c) => Math.max(0, c - 1));
    });
  }, []);

  const startCapture = useCallback(async () => {
    setStreamState("requesting");
    setError("");
    try {
      const q = QUALITY_SETTINGS[quality];
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: q.width },
          height: { ideal: q.height },
          frameRate: { ideal: q.frameRate },
        },
        // Capture system/tab/desktop audio
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          sampleRate: 44100,
        },
      });

      streamRef.current = displayStream;

      // Track whether audio was actually granted by the browser
      const hasAudio = displayStream.getAudioTracks().length > 0;
      setAudioEnabled(hasAudio);

      if (previewRef.current) {
        previewRef.current.srcObject = displayStream;
      }

      setStreamState("live");

      // Handle user stopping stream via browser's built-in "Stop sharing" button
      displayStream.getVideoTracks()[0].addEventListener("ended", () => {
        stopStream();
      });

      // Call any viewers who connected before stream was ready
      dataConnsRef.current.forEach((_dc, viewerId) => {
        if (!mediaCallsRef.current.has(viewerId)) {
          callViewer(viewerId);
        }
      });
    } catch {
      setError("Screen capture was denied or cancelled.");
      setStreamState("error");
    }
  }, [quality, callViewer]); // eslint-disable-line react-hooks/exhaustive-deps

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaCallsRef.current.forEach((call) => call.close());
    mediaCallsRef.current.clear();
    dataConnsRef.current.forEach((dc) => dc.close());
    dataConnsRef.current.clear();
    setViewerCount(0);
    setStreamState("stopped");
    peerRef.current?.destroy();
    chrome.runtime.sendMessage({ type: "STOP_BROADCAST" });
    setTimeout(() => window.close(), 1500);
  }, []);

  const changeQuality = useCallback(
    async (newQuality: Quality) => {
      setQuality(newQuality);
      if (streamState !== "live" || !streamRef.current) return;
      const q = QUALITY_SETTINGS[newQuality];
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        await videoTrack.applyConstraints({
          width: { ideal: q.width },
          height: { ideal: q.height },
          frameRate: { ideal: q.frameRate },
        });
      }
    },
    [streamState]
  );

  const toggleAudio = useCallback(() => {
    if (!streamRef.current) return;
    const audioTracks = streamRef.current.getAudioTracks();
    if (audioTracks.length === 0) {
      // No system audio was captured — nothing to toggle
      setError("No system audio was captured. Re-share your screen and enable 'Share system audio'.");
      return;
    }
    const next = !audioEnabled;
    audioTracks.forEach((t) => {
      t.enabled = next;
    });
    setAudioEnabled(next);
  }, [audioEnabled]);

  const copyUrl = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusColor = {
    idle: "bg-gray-500",
    requesting: "bg-yellow-500 animate-pulse",
    live: "bg-red-500 animate-pulse",
    stopped: "bg-gray-500",
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
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-gray-900/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
            <Monitor className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">Oculus Broadcaster</h1>
            <p className="text-xs text-gray-500">Control Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <span className={`w-2 h-2 rounded-full ${statusColor}`} />
            <span className="text-xs font-medium text-gray-300">{statusLabel}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Users className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-xs font-medium text-gray-300">{viewerCount}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 gap-6 p-6 max-w-5xl mx-auto w-full">
        {/* Preview */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-white/[0.08] aspect-video">
            <video
              ref={previewRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-contain"
            />
            {streamState !== "live" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Monitor className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-sm text-gray-500 text-center px-4">
                  {streamState === "requesting"
                    ? "Waiting for screen selection..."
                    : streamState === "stopped"
                    ? "Stream ended"
                    : streamState === "error"
                    ? error
                    : "No preview available"}
                </p>
                {(streamState === "error" || streamState === "idle") && (
                  <button
                    onClick={startCapture}
                    className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-colors"
                  >
                    {streamState === "error" ? "Retry Capture" : "Start Capture"}
                  </button>
                )}
              </div>
            )}
            {/* Live badge */}
            {streamState === "live" && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/90 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-xs font-bold text-white">LIVE</span>
              </div>
            )}
            {/* Connection status */}
            <div className="absolute top-3 right-3">
              {peerReady ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-500/30">
                  <Wifi className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">Ready</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-700/60 backdrop-blur-sm">
                  <WifiOff className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-400">Connecting...</span>
                </div>
              )}
            </div>
          </div>

          {/* Error toast */}
          {error && streamState === "live" && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs">
              <span className="mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Share URL */}
          {shareUrl && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/[0.08]">
              <span className="flex-1 text-xs text-gray-400 truncate font-mono">{shareUrl}</span>
              <button
                onClick={copyUrl}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>
          )}
        </div>

        {/* Controls Panel */}
        <div className="w-64 flex flex-col gap-4">
          {/* Quality Selector */}
          <div className="rounded-2xl bg-gray-900 border border-white/[0.08] p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-semibold text-white">Quality</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["1080p", "720p", "480p", "360p"] as Quality[]).map((q) => (
                <button
                  key={q}
                  onClick={() => changeQuality(q)}
                  className={`py-2 rounded-lg text-xs font-medium transition-all ${
                    quality === q
                      ? "bg-brand-600 text-white shadow-lg shadow-brand-900/40"
                      : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Toggle (System / Desktop audio) */}
          <div className="rounded-2xl bg-gray-900 border border-white/[0.08] p-4 space-y-3">
            <div className="flex items-center gap-2">
              {audioEnabled ? (
                <Volume2 className="w-4 h-4 text-brand-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-500" />
              )}
              <h3 className="text-sm font-semibold text-white">System Audio</h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              {audioEnabled
                ? "Desktop audio is being shared with viewers."
                : "Desktop audio is muted. Toggle to share sound from your screen."}
            </p>
            <button
              onClick={toggleAudio}
              disabled={!streamRef.current}
              className={`w-full py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                audioEnabled
                  ? "bg-brand-600/20 border border-brand-500/40 text-brand-300 hover:bg-brand-600/30"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-200"
              }`}
            >
              {audioEnabled ? "Mute Audio" : "Unmute Audio"}
            </button>
            <p className="text-[10px] text-gray-600 leading-relaxed">
              To share audio, enable &quot;Share system audio&quot; in the browser screen picker.
            </p>
          </div>

          {/* Viewer Count */}
          <div className="rounded-2xl bg-gray-900 border border-white/[0.08] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-400" />
                <span className="text-sm font-semibold text-white">Viewers</span>
              </div>
              <span className="text-2xl font-bold text-white">{viewerCount}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Active connections</p>
          </div>

          {/* Stop Button */}
          <button
            onClick={stopStream}
            disabled={streamState === "stopped"}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
          >
            <Square className="w-4 h-4 fill-red-400" />
            Stop Broadcasting
          </button>

          {streamState === "live" && (
            <button
              onClick={startCapture}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-xs font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Change Screen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
