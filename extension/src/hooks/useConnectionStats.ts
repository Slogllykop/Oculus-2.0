import type { MediaConnection } from "peerjs";
import { useEffect, useRef, useState } from "react";

/** Latency quality level for color-coding the UI indicator */
export type LatencyLevel = "good" | "moderate" | "poor";

/** Outbound stream quality metrics derived from WebRTC stats */
export interface StreamQuality {
    /** Actual outbound frame width, -1 if unavailable */
    frameWidth: number;
    /** Actual outbound frame height, -1 if unavailable */
    frameHeight: number;
    /** Frames per second being sent, -1 if unavailable */
    fps: number;
    /** Current outbound bitrate in kbps, -1 if unavailable */
    bitrateKbps: number;
}

interface ConnectionStatsResult {
    /** Average round-trip time in milliseconds across all active peers. -1 if unavailable. */
    latencyMs: number;
    /** Qualitative latency level for UI color-coding */
    latencyLevel: LatencyLevel;
    /** Current outbound stream quality metrics */
    streamQuality: StreamQuality;
}

const EMPTY_QUALITY: StreamQuality = {
    frameWidth: -1,
    frameHeight: -1,
    fps: -1,
    bitrateKbps: -1,
};

/**
 * Polls `RTCPeerConnection.getStats()` on all active media calls every
 * `intervalMs` to compute:
 *  1. Average round-trip latency across viewers
 *  2. Outbound video stream quality (resolution, FPS, bitrate)
 *
 * Latency is extracted from `candidate-pair` stats where `state === "succeeded"`.
 * Stream quality is extracted from `outbound-rtp` stats where `kind === "video"`.
 * Bitrate is computed from delta `bytesSent` between polling intervals.
 */
export function useConnectionStats(
    mediaCallsRef: React.RefObject<Map<string, MediaConnection>>,
    streamLive: boolean,
    intervalMs = 2_000,
): ConnectionStatsResult {
    const [latencyMs, setLatencyMs] = useState(-1);
    const [streamQuality, setStreamQuality] = useState<StreamQuality>(EMPTY_QUALITY);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Track previous bytes/timestamp for bitrate delta computation
    const prevBytesRef = useRef<number>(0);
    const prevTimestampRef = useRef<number>(0);

    useEffect(() => {
        if (!streamLive) {
            setLatencyMs(-1);
            setStreamQuality(EMPTY_QUALITY);
            prevBytesRef.current = 0;
            prevTimestampRef.current = 0;
            if (timerRef.current !== null) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        const poll = async () => {
            const calls = mediaCallsRef.current;
            if (!calls || calls.size === 0) {
                setLatencyMs(-1);
                setStreamQuality(EMPTY_QUALITY);
                return;
            }

            const rtts: number[] = [];
            let bestWidth = -1;
            let bestHeight = -1;
            let bestFps = -1;
            let totalBytesSent = 0;
            let hasOutboundStats = false;

            for (const call of calls.values()) {
                const pc: RTCPeerConnection | undefined = call.peerConnection;
                if (!pc) continue;

                try {
                    const stats = await pc.getStats();
                    stats.forEach((report) => {
                        // Latency from candidate-pair
                        if (
                            report.type === "candidate-pair" &&
                            report.state === "succeeded" &&
                            typeof report.currentRoundTripTime === "number"
                        ) {
                            rtts.push(report.currentRoundTripTime * 1_000); // seconds → ms
                        }

                        // Stream quality from outbound-rtp (video)
                        if (report.type === "outbound-rtp" && report.kind === "video") {
                            hasOutboundStats = true;

                            if (
                                typeof report.frameWidth === "number" &&
                                report.frameWidth > bestWidth
                            ) {
                                bestWidth = report.frameWidth;
                            }
                            if (
                                typeof report.frameHeight === "number" &&
                                report.frameHeight > bestHeight
                            ) {
                                bestHeight = report.frameHeight;
                            }
                            if (
                                typeof report.framesPerSecond === "number" &&
                                report.framesPerSecond > bestFps
                            ) {
                                bestFps = report.framesPerSecond;
                            }
                            if (typeof report.bytesSent === "number") {
                                totalBytesSent += report.bytesSent;
                            }
                        }
                    });
                } catch {
                    /* peer may have been destroyed mid-poll */
                }
            }

            // Latency
            if (rtts.length > 0) {
                const avg = rtts.reduce((a, b) => a + b, 0) / rtts.length;
                setLatencyMs(Math.round(avg));
            } else {
                setLatencyMs(-1);
            }

            // Stream quality
            if (hasOutboundStats) {
                const now = Date.now();
                let bitrateKbps = -1;

                if (prevTimestampRef.current > 0 && prevBytesRef.current > 0) {
                    const deltaBytes = totalBytesSent - prevBytesRef.current;
                    const deltaSec = (now - prevTimestampRef.current) / 1_000;
                    if (deltaSec > 0 && deltaBytes >= 0) {
                        bitrateKbps = Math.round((deltaBytes * 8) / deltaSec / 1_000);
                    }
                }

                prevBytesRef.current = totalBytesSent;
                prevTimestampRef.current = now;

                setStreamQuality({
                    frameWidth: bestWidth,
                    frameHeight: bestHeight,
                    fps: bestFps > 0 ? Math.round(bestFps) : -1,
                    bitrateKbps,
                });
            } else {
                setStreamQuality(EMPTY_QUALITY);
            }
        };

        // Run immediately, then poll on interval
        poll();
        timerRef.current = setInterval(poll, intervalMs);

        return () => {
            if (timerRef.current !== null) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [streamLive, mediaCallsRef, intervalMs]);

    const latencyLevel: LatencyLevel =
        latencyMs < 0 ? "good" : latencyMs < 100 ? "good" : latencyMs < 300 ? "moderate" : "poor";

    return { latencyMs, latencyLevel, streamQuality };
}
