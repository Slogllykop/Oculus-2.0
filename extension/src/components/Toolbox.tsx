import { RefreshCw, Square } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { VIEWER_BASE_URL } from "@/constants";
import { usePeerConnection } from "@/hooks/usePeerConnection";
import { useScreenCapture } from "@/hooks/useScreenCapture";
import { AudioPanel } from "./toolbox/AudioPanel";
import { QualityPanel } from "./toolbox/QualityPanel";
import { ShareUrlBar } from "./toolbox/ShareUrlBar";
import { StreamPreview } from "./toolbox/StreamPreview";
import { ToolboxHeader } from "./toolbox/ToolboxHeader";
import { ViewerCountCard } from "./toolbox/ViewerCountCard";

export default function Toolbox() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [shareUrl, setShareUrl] = useState("");

    // Stable ref so usePeerConnection's onPeerReady can trigger startCapture
    const startCaptureRef = useRef<((isReplace?: boolean) => Promise<void>) | null>(null);

    const handlePeerReady = useCallback(() => {
        startCaptureRef.current?.(false);
    }, []);

    // Retrieve session from background service worker
    useEffect(() => {
        chrome.runtime.sendMessage({ type: "GET_SESSION" }, (res) => {
            if (res?.sessionId) {
                setSessionId(res.sessionId);
                setShareUrl(`${VIEWER_BASE_URL}/watch/${res.sessionId}`);
            }
        });
    }, []);

    // ─── Peer connection ──────────────────────────────────────────────────────
    const peer = usePeerConnection({ sessionId, onPeerReady: handlePeerReady });

    // ─── Screen capture ───────────────────────────────────────────────────────
    const capture = useScreenCapture({
        qualityRef: peer.qualityRef,
        outStreamRef: peer.outStreamRef,
        mediaCallsRef: peer.mediaCallsRef,
        dataConnsRef: peer.dataConnsRef,
        applyBitrateToAllCalls: peer.applyBitrateToAllCalls,
        replaceTrackOnAllCalls: peer.replaceTrackOnAllCalls,
        callViewer: peer.callViewer,
        destroyPeer: peer.destroyPeer,
        resetViewerCount: peer.resetViewerCount,
    });

    // Keep the ref in sync so the peer callback always calls the latest capture function
    useEffect(() => {
        startCaptureRef.current = capture.startCapture;
    }, [capture.startCapture]);

    return (
        <div className="min-h-screen bg-surface-0 text-white font-sans flex flex-col relative overflow-hidden">
            {/* Background orbs */}
            <div
                className="absolute top-0 -left-1/4 w-[500px] h-[500px] rounded-full bg-accent-blue/4 blur-[150px] pointer-events-none animate-float"
                aria-hidden="true"
            />
            <div
                className="absolute bottom-0 -right-1/4 w-[500px] h-[500px] rounded-full bg-accent-violet/4 blur-[150px] pointer-events-none animate-float"
                style={{ animationDelay: "2s" }}
                aria-hidden="true"
            />

            <ToolboxHeader streamState={capture.streamState} viewerCount={peer.viewerCount} />

            <div className="flex flex-1 gap-6 p-6 max-w-5xl mx-auto w-full relative z-10 animate-fade-in">
                {/* Preview Column */}
                <div className="flex-1 flex flex-col gap-4">
                    <StreamPreview
                        streamState={capture.streamState}
                        error={capture.error}
                        peerReady={peer.peerReady}
                        previewRef={capture.previewRef}
                        onRetryCapture={() => capture.startCapture(false)}
                    />

                    {capture.error && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-accent-amber/10 border border-accent-amber/20 text-accent-amber-light text-xs">
                            <span className="mt-0.5" aria-hidden="true">
                                ⚠
                            </span>
                            <span>{capture.error}</span>
                        </div>
                    )}

                    <ShareUrlBar url={shareUrl} />
                </div>

                {/* Controls Column */}
                <div className="w-64 flex flex-col gap-4">
                    <QualityPanel
                        quality={capture.quality}
                        streamState={capture.streamState}
                        onChangeQuality={capture.changeQuality}
                    />

                    <AudioPanel
                        audioEnabled={capture.audioEnabled}
                        hasSilentPlaceholder={!!capture.silentTrackRef.current}
                        hasOutStream={!!peer.outStreamRef.current}
                        onToggleAudio={capture.toggleAudio}
                    />

                    <ViewerCountCard count={peer.viewerCount} />

                    {capture.streamState === "live" && (
                        <button
                            type="button"
                            onClick={() => capture.startCapture(true)}
                            aria-label="Change shared screen or window"
                            className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-surface-2 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wide transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-white/50 shadow-sm hover:shadow-xl"
                        >
                            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                            Change Screen
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={capture.stopStream}
                        disabled={capture.streamState === "stopped"}
                        aria-label="Stop broadcasting"
                        className="group flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-surface-2 border border-white/5 hover:border-accent-red/30 hover:bg-accent-red/10 text-zinc-400 hover:text-accent-red-light font-bold text-xs uppercase tracking-wide transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-accent-red shadow-sm hover:shadow-xl"
                    >
                        <Square
                            className="w-3 h-3 fill-zinc-600 group-hover:fill-accent-red transition-colors"
                            aria-hidden="true"
                        />
                        Stop Broadcast
                    </button>
                </div>
            </div>
        </div>
    );
}
