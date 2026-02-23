"use client";

import { Maximize2, Volume2, VolumeX } from "lucide-react";

interface StreamControlsProps {
    muted: boolean;
    showControls: boolean;
    onToggleMute: () => void;
    onToggleFullscreen: () => void;
}

/** Bottom control bar with mute/fullscreen buttons, auto-fades on inactivity. */
export function StreamControls({
    muted,
    showControls,
    onToggleMute,
    onToggleFullscreen,
}: StreamControlsProps) {
    return (
        <>
            {/* LIVE badge */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-red/90 backdrop-blur-sm">
                <span
                    className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"
                    aria-hidden="true"
                />
                <span className="text-xs font-bold text-white">LIVE</span>
            </div>

            {/* Bottom controls */}
            <div
                className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
                    showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
            >
                <div className="bg-linear-to-t from-black/90 to-transparent p-4 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={onToggleMute}
                        aria-label={muted ? "Unmute audio" : "Mute audio"}
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm border border-white/10 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent-blue"
                    >
                        {muted ? (
                            <VolumeX className="w-5 h-5" aria-hidden="true" />
                        ) : (
                            <Volume2 className="w-5 h-5" aria-hidden="true" />
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onToggleFullscreen}
                        aria-label="Toggle fullscreen"
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm border border-white/10 cursor-pointer focus-visible:ring-2 focus-visible:ring-accent-blue"
                    >
                        <Maximize2 className="w-5 h-5" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </>
    );
}
