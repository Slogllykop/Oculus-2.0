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
        <div className="min-h-screen bg-black text-gray-100 font-sans flex flex-col">
            <ToolboxHeader streamState={capture.streamState} viewerCount={peer.viewerCount} />

            <div className="flex flex-1 gap-6 p-6 max-w-5xl mx-auto w-full">
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
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs">
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
                            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-white/4 border border-white/8 hover:bg-white/[0.07] text-zinc-300 text-xs font-medium transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        >
                            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                            Change Screen / Window
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={capture.stopStream}
                        disabled={capture.streamState === "stopped"}
                        aria-label="Stop broadcasting"
                        className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-semibold text-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    >
                        <Square className="w-4 h-4 fill-red-400" aria-hidden="true" />
                        Stop Broadcasting
                    </button>
                </div>
            </div>
        </div>
    );
}
