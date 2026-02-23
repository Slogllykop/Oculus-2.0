import { Monitor, Wifi, WifiOff } from "lucide-react";
import type { StreamState } from "@/types";

interface StreamPreviewProps {
    streamState: StreamState;
    error: string;
    peerReady: boolean;
    previewRef: React.RefObject<HTMLVideoElement | null>;
    onRetryCapture: () => void;
}

/** Video preview panel with LIVE badge, connection status, and error/idle overlays. */
export function StreamPreview({
    streamState,
    error,
    peerReady,
    previewRef,
    onRetryCapture,
}: StreamPreviewProps) {
    return (
        <div className="relative rounded-2xl overflow-hidden bg-zinc-950 border border-white/[0.07] aspect-video">
            <video
                ref={previewRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-contain"
            />

            {/* Idle / Error / Requesting overlay */}
            {streamState !== "live" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center">
                        <Monitor className="w-8 h-8 text-zinc-600" aria-hidden="true" />
                    </div>
                    <p className="text-sm text-zinc-500 text-center px-4">
                        {streamState === "requesting"
                            ? "Waiting for screen selection…"
                            : streamState === "stopped"
                              ? "Stream ended"
                              : streamState === "error"
                                ? error
                                : "No preview available"}
                    </p>
                    {streamState === "error" && (
                        <button
                            type="button"
                            onClick={onRetryCapture}
                            className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        >
                            Retry Capture
                        </button>
                    )}
                </div>
            )}

            {/* LIVE badge */}
            {streamState === "live" && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/90 backdrop-blur-sm">
                    <span
                        className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"
                        aria-hidden="true"
                    />
                    <span className="text-xs font-bold text-white">LIVE</span>
                </div>
            )}

            {/* Connection status badge */}
            <div className="absolute top-3 right-3">
                {peerReady ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/10 backdrop-blur-sm border border-brand-500/20">
                        <Wifi className="w-3 h-3 text-brand-400" aria-hidden="true" />
                        <span className="text-xs text-brand-400">Ready</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/6 backdrop-blur-sm border border-white/8">
                        <WifiOff className="w-3 h-3 text-zinc-500" aria-hidden="true" />
                        <span className="text-xs text-zinc-500">Connecting…</span>
                    </div>
                )}
            </div>
        </div>
    );
}
