"use client";

import { useEffect, useRef, useState } from "react";
import type { ViewState } from "@/types";

interface UseAutoHideControlsOptions {
    viewState: ViewState;
    containerRef: React.RefObject<HTMLDivElement | null>;
    hideAfterMs?: number;
}

/**
 * Auto-hide overlay controls after a period of mouse/touch inactivity.
 * Controls are always visible when not in the "streaming" state.
 */
export function useAutoHideControls({
    viewState,
    containerRef,
    hideAfterMs = 3000,
}: UseAutoHideControlsOptions) {
    const [showControls, setShowControls] = useState(true);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (viewState !== "streaming") {
            setShowControls(true);
            return;
        }

        const resetTimer = () => {
            setShowControls(true);
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => setShowControls(false), hideAfterMs);
        };

        const container = containerRef.current;
        container?.addEventListener("mousemove", resetTimer);
        container?.addEventListener("touchstart", resetTimer);
        resetTimer();

        return () => {
            container?.removeEventListener("mousemove", resetTimer);
            container?.removeEventListener("touchstart", resetTimer);
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [viewState, containerRef, hideAfterMs]);

    return showControls;
}
