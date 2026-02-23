"use client";

import { Loader2, WifiOff } from "lucide-react";
import Image from "next/image";
import type { ViewState } from "@/types";

interface ViewerHeaderProps {
    sessionId: string;
    viewState: ViewState;
}

/** Header bar with branding and multi-color connection state badge. */
export function ViewerHeader({ sessionId, viewState }: ViewerHeaderProps) {
    return (
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/6 bg-surface-1/80 backdrop-blur-sm relative z-10 animate-fade-in">
            <div className="flex items-center gap-3">
                <Image
                    src="/icon500.png"
                    alt="Oculus Logo"
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain"
                />
                <div>
                    <h1 className="text-sm font-bold text-white tracking-wide">Oculus</h1>
                    <p className="text-xs text-zinc-600 font-mono truncate max-w-[200px]">
                        {sessionId.slice(0, 8)}…
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {viewState === "streaming" && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-red/10 border border-accent-red/20">
                        <span
                            className="w-2 h-2 rounded-full bg-accent-red animate-pulse"
                            aria-hidden="true"
                        />
                        <span className="text-xs font-semibold text-accent-red-light">LIVE</span>
                    </div>
                )}
                {viewState === "waiting" && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-amber/10 border border-accent-amber/20">
                        <Loader2
                            className="w-3 h-3 text-accent-amber animate-spin"
                            aria-hidden="true"
                        />
                        <span className="text-xs text-accent-amber-light">
                            Waiting for broadcaster
                        </span>
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
                        <WifiOff className="w-3 h-3 text-zinc-600" aria-hidden="true" />
                        <span className="text-xs text-zinc-600">Stream ended</span>
                    </div>
                )}
            </div>
        </header>
    );
}
