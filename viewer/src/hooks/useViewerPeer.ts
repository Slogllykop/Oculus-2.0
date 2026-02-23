"use client";

import Peer from "peerjs";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ViewState } from "@/types";

interface UseViewerPeerOptions {
    sessionId: string;
    videoRef: React.RefObject<HTMLVideoElement | null>;
}

interface UseViewerPeerReturn {
    viewState: ViewState;
    errorMsg: string;
    retryCount: number;
    muted: boolean;
    toggleMute: () => void;
    retry: () => void;
}

/**
 * Manages the PeerJS viewer lifecycle:
 * - Creates a Peer, fetches ICE servers, connects to broadcaster
 * - Handles auto-retry on failure/disconnection
 * - Manages mute/unmute state
 */
export function useViewerPeer({ sessionId, videoRef }: UseViewerPeerOptions): UseViewerPeerReturn {
    const [viewState, setViewState] = useState<ViewState>("connecting");
    const [muted, setMuted] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [retryCount, setRetryCount] = useState(0);

    const peerRef = useRef<Peer | null>(null);
    const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const viewStateRef = useRef<ViewState>("connecting");
    const abortControllerRef = useRef<AbortController | null>(null);

    const setViewStateSync = useCallback((s: ViewState) => {
        viewStateRef.current = s;
        setViewState(s);
    }, []);

    const scheduleRetry = useCallback(() => {
        if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
        retryTimerRef.current = setTimeout(() => {
            setRetryCount((c) => c + 1);
        }, 3000);
    }, []);

    const connect = useCallback(async () => {
        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        const broadcasterId = `oculus-host-${sessionId}`;

        let iceServers: RTCIceServer[] = [];
        try {
            const res = await fetch("/api/turn", { signal: abortController.signal });
            const creds = await res.json();
            iceServers = creds.iceServers;
        } catch (err: unknown) {
            if (err instanceof Error && err.name === "AbortError") return;
            console.error("Failed to fetch ICE servers:", err);
        }

        if (abortController.signal.aborted) return;

        const peer = new Peer({
            debug: 2,
            config: { iceServers, iceCandidatePoolSize: 10 },
        });

        peerRef.current = peer;

        peer.on("open", () => {
            setViewStateSync("waiting");
            const dataConn = peer.connect(broadcasterId, { reliable: true });
            dataConn.on("error", (err) => {
                console.warn("Data connection error:", err);
            });
        });

        peer.on("call", (call) => {
            call.answer();
            call.on("stream", (remoteStream) => {
                const video = videoRef.current;
                if (video) {
                    video.srcObject = remoteStream;
                    video.muted = true;
                    video.play().catch((e) => console.warn("Autoplay failed:", e));
                }
                setMuted(true);
                setViewStateSync("streaming");
            });
            call.on("close", () => setViewStateSync("disconnected"));
            call.on("error", () => setViewStateSync("disconnected"));
        });

        peer.on("error", (err) => {
            if (err.type === "peer-unavailable") {
                setViewStateSync("waiting");
                scheduleRetry();
            } else {
                setErrorMsg(`Connection error: ${err.message}`);
                setViewStateSync("error");
            }
        });

        peer.on("disconnected", () => {
            if (viewStateRef.current !== "streaming") {
                scheduleRetry();
            } else {
                try {
                    peer.reconnect();
                } catch {
                    scheduleRetry();
                }
            }
        });
    }, [sessionId, videoRef, setViewStateSync, scheduleRetry]);

    useEffect(() => {
        connect();
        return () => {
            if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
            peerRef.current?.destroy();
        };
    }, [retryCount]);

    const toggleMute = useCallback(() => {
        if (videoRef.current) {
            const next = !videoRef.current.muted;
            videoRef.current.muted = next;
            setMuted(next);
        }
    }, [videoRef]);

    const retry = useCallback(() => {
        setViewStateSync("connecting");
        setErrorMsg("");
        if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
        setRetryCount((c) => c + 1);
    }, [setViewStateSync]);

    return { viewState, errorMsg, retryCount, muted, toggleMute, retry };
}
