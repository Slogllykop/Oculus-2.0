import { useCallback, useEffect, useRef, useState } from "react";
import type { StreamState } from "@/types";

/**
 * Returns a live HH:MM:SS elapsed-time string that starts counting when the
 * stream goes "live" and resets to "00:00:00" when the stream is stopped or
 * encounters an error.
 *
 * The timer updates once per second via `setInterval`.
 */
export function useElapsedTime(streamState: StreamState) {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const clearTimer = useCallback(() => {
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (streamState === "live") {
            // Reset and start
            setElapsedSeconds(0);
            clearTimer();
            intervalRef.current = setInterval(() => {
                setElapsedSeconds((prev) => prev + 1);
            }, 1_000);
        } else {
            // Any non-live state → stop and reset
            clearTimer();
            setElapsedSeconds(0);
        }

        return clearTimer;
    }, [streamState, clearTimer]);

    const hours = Math.floor(elapsedSeconds / 3_600);
    const minutes = Math.floor((elapsedSeconds % 3_600) / 60);
    const seconds = elapsedSeconds % 60;

    const formatted = [hours, minutes, seconds].map((v) => String(v).padStart(2, "0")).join(":");

    return formatted;
}
