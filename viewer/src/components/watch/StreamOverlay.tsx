"use client";

import { AlertCircle, Loader2, Radio, RefreshCw, WifiOff } from "lucide-react";
import type { ViewState } from "@/types";

interface StreamOverlayProps {
    viewState: ViewState;
    errorMsg: string;
    retryCount: number;
    onRetry: () => void;
}

/** State-specific overlays rendered inside the video container when not streaming. */
export function StreamOverlay({ viewState, errorMsg, retryCount, onRetry }: StreamOverlayProps) {
    if (viewState === "streaming") return null;

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
            {viewState === "connecting" && (
                <>
                    <div className="w-20 h-20 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center">
                        <Loader2
                            className="w-8 h-8 text-accent-blue animate-spin"
                            aria-hidden="true"
                        />
                    </div>
                    <div className="text-center">
                        <p className="text-white font-semibold">Connecting to stream…</p>
                        <p className="text-sm text-zinc-500 mt-1">Setting up peer connection</p>
                    </div>
                </>
            )}

            {viewState === "waiting" && (
                <>
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center">
                            <Radio className="w-8 h-8 text-accent-green" aria-hidden="true" />
                        </div>
                        <span
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-green animate-ping opacity-75"
                            aria-hidden="true"
                        />
                        <span
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-green"
                            aria-hidden="true"
                        />
                    </div>
                    <div className="text-center">
                        <p className="text-white font-semibold">Waiting for broadcaster</p>
                        <p className="text-sm text-zinc-500 mt-1">
                            Stream will start automatically when the broadcaster goes live
                        </p>
                        {retryCount > 0 && (
                            <div className="flex items-center justify-center gap-2 mt-3">
                                <Loader2
                                    className="w-3.5 h-3.5 text-zinc-600 animate-spin"
                                    aria-hidden="true"
                                />
                                <span className="text-xs text-zinc-600">
                                    Retrying… (attempt {retryCount})
                                </span>
                            </div>
                        )}
                    </div>
                </>
            )}

            {viewState === "disconnected" && (
                <>
                    <div className="w-20 h-20 rounded-2xl bg-white/4 border border-white/[0.07] flex items-center justify-center">
                        <WifiOff className="w-8 h-8 text-zinc-600" aria-hidden="true" />
                    </div>
                    <div className="text-center">
                        <p className="text-white font-semibold">Stream ended</p>
                        <p className="text-sm text-zinc-500 mt-1">
                            The broadcaster has stopped sharing
                        </p>
                        <button
                            type="button"
                            onClick={onRetry}
                            className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/6 border border-white/8 text-zinc-300 text-sm hover:bg-white/10 transition-colors mx-auto cursor-pointer focus-visible:ring-2 focus-visible:ring-accent-blue"
                        >
                            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                            Try reconnecting
                        </button>
                    </div>
                </>
            )}

            {viewState === "error" && (
                <>
                    <div className="w-20 h-20 rounded-2xl bg-accent-red/10 border border-accent-red/20 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-accent-red" aria-hidden="true" />
                    </div>
                    <div className="text-center">
                        <p className="text-white font-semibold">Connection failed</p>
                        <p className="text-sm text-zinc-500 mt-1">
                            {errorMsg || "Unable to connect to stream"}
                        </p>
                        <button
                            type="button"
                            onClick={onRetry}
                            className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold transition-all mx-auto cursor-pointer hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-accent-blue"
                        >
                            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                            Retry
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
