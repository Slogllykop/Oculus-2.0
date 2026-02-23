"use client";

import { Monitor, Wifi, WifiOff } from "lucide-react";
import type { ViewState } from "@/types";

interface StatusBarProps {
    viewState: ViewState;
}

/** Human-readable status message labels */
const STATUS_MESSAGES: Record<ViewState, string> = {
    streaming: "Stream connected — watching live",
    waiting: "Waiting for broadcast to start…",
    connecting: "Establishing connection…",
    disconnected: "Stream has ended",
    error: "Connection failed",
};

/** Info bar showing connection status text and P2P badge. */
export function StatusBar({ viewState }: StatusBarProps) {
    return (
        <div className="w-full max-w-6xl flex items-center justify-between px-4 py-3 rounded-xl bg-surface-2 border border-white/6">
            <div className="flex items-center gap-2">
                {viewState === "streaming" ? (
                    <Wifi className="w-4 h-4 text-accent-green" aria-hidden="true" />
                ) : (
                    <WifiOff className="w-4 h-4 text-zinc-600" aria-hidden="true" />
                )}
                <span className="text-sm text-zinc-400">{STATUS_MESSAGES[viewState]}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-700">
                <Monitor className="w-3.5 h-3.5" aria-hidden="true" />
                <span>P2P · End-to-end</span>
            </div>
        </div>
    );
}
