"use client";

import { Loader2, Monitor, WifiOff } from "lucide-react";
import type { ViewState } from "@/types";

interface ViewerHeaderProps {
    sessionId: string;
    viewState: ViewState;
}

/** Header bar with branding and connection state badge. */
export function ViewerHeader({ sessionId, viewState }: ViewerHeaderProps) {
    return (
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/6 bg-zinc-950/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                    <Monitor className="w-4 h-4 text-white" aria-hidden="true" />
                </div>
                <div>
                    <h1 className="text-sm font-bold text-white tracking-wide">Oculus</h1>
                    <p className="text-xs text-zinc-500 font-mono truncate max-w-[200px]">
                        {sessionId.slice(0, 8)}…
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {viewState === "streaming" && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                        <span
                            className="w-2 h-2 rounded-full bg-red-500 animate-pulse"
                            aria-hidden="true"
                        />
                        <span className="text-xs font-semibold text-red-400">LIVE</span>
                    </div>
                )}
                {viewState === "waiting" && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                        <Loader2
                            className="w-3 h-3 text-yellow-400 animate-spin"
                            aria-hidden="true"
                        />
                        <span className="text-xs text-yellow-400">Waiting for broadcaster</span>
                    </div>
                )}
                {viewState === "connecting" && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/8">
                        <Loader2
                            className="w-3 h-3 text-zinc-400 animate-spin"
                            aria-hidden="true"
                        />
                        <span className="text-xs text-zinc-400">Connecting…</span>
                    </div>
                )}
                {viewState === "disconnected" && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/4 border border-white/[0.07]">
                        <WifiOff className="w-3 h-3 text-zinc-500" aria-hidden="true" />
                        <span className="text-xs text-zinc-500">Stream ended</span>
                    </div>
                )}
            </div>
        </header>
    );
}
