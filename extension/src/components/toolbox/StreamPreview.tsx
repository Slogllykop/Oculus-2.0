import { Monitor, Wifi, WifiOff } from "lucide-react";
import type { StreamState } from "@/types";

interface StreamPreviewProps {
    streamState: StreamState;
    error: string;
    peerReady: boolean;
    previewRef: React.RefObject<HTMLVideoElement | null>;
    onRetryCapture: () => void;
}

export function StreamPreview({
    streamState,
    error,
    peerReady,
    previewRef,
    onRetryCapture,
}: StreamPreviewProps) {
    return (
        <div className="relative rounded-2xl overflow-hidden bg-[#0A0A0A] border border-white/5 aspect-video group">
            <video
                ref={previewRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-contain"
            />

            {/* Subtle inner grid for inactive state to match landing page browser mockup */}
            {streamState !== "live" && (
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                    aria-hidden="true"
                />
            )}

            {/* Idle / Error / Requesting overlay */}
            {streamState !== "live" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                    <div className="w-14 h-14 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-center shadow-2xl">
                        <Monitor className="w-6 h-6 text-zinc-600" aria-hidden="true" />
                    </div>
                    <p className="text-xs text-zinc-500 font-medium text-center px-4">
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
                            className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-bold transition-all cursor-pointer hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-white/50 shadow-[0_0_15px_rgba(255,255,255,0.1)] mt-2"
                        >
                            Retry Capture
                        </button>
                    )}
                </div>
            )}

            {/* Top gradient shadow for badges */}
            {streamState === "live" && (
                <div className="absolute top-0 left-0 right-0 h-20 bg-linear-to-b from-black/60 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            )}

            {/* LIVE badge */}
            {streamState === "live" && (
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2/80 backdrop-blur-md border border-white/5 shadow-xl">
                    <span
                        className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                        aria-hidden="true"
                    />
                    <span className="text-xs font-bold text-white tracking-widest uppercase">
                        Live
                    </span>
                </div>
            )}

            {/* Connection status badge */}
            <div className="absolute top-4 right-4">
                {peerReady ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2/80 backdrop-blur-md border border-white/5 shadow-xl">
                        <Wifi className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                        <span className="text-xs font-medium text-zinc-300">Ready</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-2/80 backdrop-blur-md border border-white/5 shadow-xl">
                        <WifiOff className="w-3.5 h-3.5 text-zinc-600" aria-hidden="true" />
                        <span className="text-xs font-medium text-zinc-500">Connecting…</span>
                    </div>
                )}
            </div>
        </div>
    );
}
