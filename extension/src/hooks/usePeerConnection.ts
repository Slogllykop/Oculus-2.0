import Peer, { type DataConnection, type MediaConnection } from "peerjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { APP_URL, QUALITY_SETTINGS } from "@/constants";
import type { Quality } from "@/types";

interface UsePeerConnectionOptions {
    sessionId: string | null;
    /** Called when the peer is ready and the stream should start capturing */
    onPeerReady: () => void;
}

interface UsePeerConnectionReturn {
    peerReady: boolean;
    viewerCount: number;
    /** Outgoing composed stream (video + audio) */
    outStreamRef: React.RefObject<MediaStream | null>;
    /** Map of active media calls by viewer ID */
    mediaCallsRef: React.RefObject<Map<string, MediaConnection>>;
    /** Map of active data connections by viewer ID */
    dataConnsRef: React.RefObject<Map<string, DataConnection>>;
    /** Apply adaptive bitrate to all active calls */
    applyBitrateToAllCalls: (q: Quality) => Promise<void>;
    /** Replace a track (by kind) on all active peer connections */
    replaceTrackOnAllCalls: (newTrack: MediaStreamTrack) => Promise<void>;
    /** Initiate a media call to a specific viewer */
    callViewer: (viewerId: string) => void;
    /** Current quality ref for use inside callbacks */
    qualityRef: React.RefObject<Quality>;
    /** Destroy the peer entirely */
    destroyPeer: () => void;
    /** Reset viewer count to zero */
    resetViewerCount: () => void;
}

/**
 * Manages the PeerJS lifecycle for the broadcaster:
 * - Creates a Peer with the session ID
 * - Fetches ICE/TURN servers from the viewer API
 * - Handles incoming data connections from viewers
 * - Provides helpers to call viewers, replace tracks, and adjust bitrate
 */
export function usePeerConnection({
    sessionId,
    onPeerReady,
}: UsePeerConnectionOptions): UsePeerConnectionReturn {
    const [peerReady, setPeerReady] = useState(false);
    const [viewerCount, setViewerCount] = useState(0);

    const peerRef = useRef<Peer | null>(null);
    const outStreamRef = useRef<MediaStream | null>(null);
    const mediaCallsRef = useRef<Map<string, MediaConnection>>(new Map());
    const dataConnsRef = useRef<Map<string, DataConnection>>(new Map());
    const qualityRef = useRef<Quality>("720p");

    // ─── Bitrate helpers ───────────────────────────────────────────────────────
    const applyBitrateToSender = useCallback(async (sender: RTCRtpSender, q: Quality) => {
        const { maxBitrate } = QUALITY_SETTINGS[q];
        try {
            const params = sender.getParameters();
            if (!params.encodings || params.encodings.length === 0) params.encodings = [{}];
            params.encodings = params.encodings.map((enc) => ({
                ...enc,
                maxBitrate,
                scaleResolutionDownBy: 1,
                networkPriority: "high" as RTCPriorityType,
                priority: "high" as RTCPriorityType,
            }));
            await sender.setParameters(params);
        } catch {
            /* silently ignore - not supported everywhere */
        }
    }, []);

    const applyBitrateToAllCalls = useCallback(
        async (q: Quality) => {
            for (const call of mediaCallsRef.current.values()) {
                const pc: RTCPeerConnection = call.peerConnection;
                if (!pc) continue;
                for (const sender of pc.getSenders()) {
                    if (sender.track?.kind === "video") await applyBitrateToSender(sender, q);
                }
            }
        },
        [applyBitrateToSender],
    );

    const replaceTrackOnAllCalls = useCallback(async (newTrack: MediaStreamTrack) => {
        const kind = newTrack.kind;
        const promises: Promise<void>[] = [];
        for (const call of mediaCallsRef.current.values()) {
            const pc: RTCPeerConnection = call.peerConnection;
            if (!pc) continue;
            for (const sender of pc.getSenders()) {
                if (sender.track?.kind === kind) {
                    promises.push(sender.replaceTrack(newTrack));
                }
            }
        }
        await Promise.all(promises);
    }, []);

    // ─── Call a viewer ─────────────────────────────────────────────────────────
    const callViewer = useCallback(
        (viewerId: string) => {
            const peer = peerRef.current;
            const outStream = outStreamRef.current;
            if (!peer || !outStream) return;

            const call = peer.call(viewerId, outStream);
            mediaCallsRef.current.set(viewerId, call);
            setViewerCount((c) => c + 1);

            call.on("stream", () => {
                setTimeout(() => applyBitrateToAllCalls(qualityRef.current), 1000);
            });
            call.on("close", () => {
                mediaCallsRef.current.delete(viewerId);
                setViewerCount((c) => Math.max(0, c - 1));
            });
            call.on("error", () => {
                mediaCallsRef.current.delete(viewerId);
                setViewerCount((c) => Math.max(0, c - 1));
            });
        },
        [applyBitrateToAllCalls],
    );

    const destroyPeer = useCallback(() => {
        peerRef.current?.destroy();
        peerRef.current = null;
    }, []);

    const resetViewerCount = useCallback(() => setViewerCount(0), []);

    // ─── Peer initialisation ──────────────────────────────────────────────────
    useEffect(() => {
        if (!sessionId) return;

        const abortController = new AbortController();

        const initPeer = async () => {
            let iceServers: RTCIceServer[] = [];
            try {
                const res = await fetch(`${APP_URL}/api/turn`, {
                    signal: abortController.signal,
                });
                const creds = await res.json();
                iceServers = creds.iceServers;
            } catch (err: unknown) {
                if (err instanceof Error && err.name === "AbortError") return;
                console.error("Failed to fetch ICE servers:", err);
            }

            if (abortController.signal.aborted) return;

            const peer = new Peer(`oculus-host-${sessionId}`, {
                debug: 2,
                config: { iceServers, iceCandidatePoolSize: 10 },
            });

            peerRef.current = peer;

            peer.on("open", () => {
                setPeerReady(true);
                onPeerReady();
            });

            peer.on("connection", (dataConn) => {
                const viewerId = dataConn.peer;
                dataConnsRef.current.set(viewerId, dataConn);

                dataConn.on("open", () => {
                    if (outStreamRef.current) callViewer(viewerId);
                });
                dataConn.on("close", () => dataConnsRef.current.delete(viewerId));
                dataConn.on("error", () => dataConnsRef.current.delete(viewerId));
            });

            peer.on("error", (err) => {
                console.error("Peer error:", err);
            });
        };

        initPeer();

        return () => {
            abortController.abort();
            peerRef.current?.destroy();
        };
    }, [sessionId, callViewer, onPeerReady]);

    return {
        peerReady,
        viewerCount,
        outStreamRef,
        mediaCallsRef,
        dataConnsRef,
        applyBitrateToAllCalls,
        replaceTrackOnAllCalls,
        callViewer,
        qualityRef,
        destroyPeer,
        resetViewerCount,
    };
}
