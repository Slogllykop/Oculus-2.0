"use client";

import { useCallback, useRef } from "react";
import { useAutoHideControls } from "@/hooks/useAutoHideControls";
import { useViewerPeer } from "@/hooks/useViewerPeer";
import { StatusBar } from "./watch/StatusBar";
import { StreamControls } from "./watch/StreamControls";
import { StreamOverlay } from "./watch/StreamOverlay";
import { ViewerHeader } from "./watch/ViewerHeader";

interface Props {
    sessionId: string;
}

export default function WatchClient({ sessionId }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const { viewState, errorMsg, retryCount, muted, toggleMute, retry } = useViewerPeer({
        sessionId,
        videoRef,
    });

    const showControls = useAutoHideControls({ viewState, containerRef });

    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }, []);

    return (
        <div className="min-h-screen bg-surface-0 flex flex-col relative overflow-hidden">
            {/* Background orbs to match landing page */}
            <div
                className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-accent-blue/4 blur-[150px] pointer-events-none animate-float"
                aria-hidden="true"
            />
            <div
                className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-accent-violet/4 blur-[130px] pointer-events-none animate-float"
                style={{ animationDelay: "2s" }}
                aria-hidden="true"
            />

            <ViewerHeader sessionId={sessionId} viewState={viewState} />

            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 gap-6 relative z-10">
                {/* Video Container */}
                <div
                    ref={containerRef}
                    className="relative w-full max-w-6xl rounded-2xl overflow-hidden bg-surface-1 border border-white/[0.07] shadow-2xl shadow-black/80 aspect-video"
                    style={{
                        cursor: showControls || viewState !== "streaming" ? "default" : "none",
                    }}
                >
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted={muted}
                        className={`w-full h-full object-contain transition-opacity duration-300 ${
                            viewState === "streaming" ? "opacity-100" : "opacity-0"
                        }`}
                    />

                    <StreamOverlay
                        viewState={viewState}
                        errorMsg={errorMsg}
                        retryCount={retryCount}
                        onRetry={retry}
                    />

                    {viewState === "streaming" && (
                        <StreamControls
                            muted={muted}
                            showControls={showControls}
                            onToggleMute={toggleMute}
                            onToggleFullscreen={toggleFullscreen}
                        />
                    )}
                </div>

                <StatusBar viewState={viewState} />

                {viewState === "waiting" && (
                    <p className="text-sm text-zinc-600 text-center max-w-md">
                        Share this page URL with others so they can watch the stream too. The stream
                        will begin as soon as the broadcaster starts sharing.
                    </p>
                )}
            </main>
        </div>
    );
}
