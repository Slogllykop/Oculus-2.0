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
                    <div className="w-20 h-20 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center">
                        <Loader2
                            className="w-8 h-8 text-brand-400 animate-spin"
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
                        <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                            <Radio className="w-8 h-8 text-brand-400" aria-hidden="true" />
                        </div>
                        <span
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-400 animate-ping opacity-75"
                            aria-hidden="true"
                        />
                        <span
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-400"
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
                            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/4 border border-white/8 text-zinc-300 text-sm hover:bg-white/[0.07] transition-colors mx-auto cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        >
                            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                            Try reconnecting
                        </button>
                    </div>
                </>
            )}

            {viewState === "error" && (
                <>
                    <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="text-center">
                        <p className="text-white font-semibold">Connection failed</p>
                        <p className="text-sm text-zinc-500 mt-1">
                            {errorMsg || "Unable to connect to stream"}
                        </p>
                        <button
                            type="button"
                            onClick={onRetry}
                            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors mx-auto cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
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
