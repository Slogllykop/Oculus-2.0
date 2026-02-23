import { useCallback, useState } from "react";

/**
 * Copy text to clipboard with a temporary "copied" feedback state.
 * @param feedbackMs Duration in ms to show the copied state (default: 2000)
 */
export function useClipboard(feedbackMs = 2000) {
    const [copied, setCopied] = useState(false);

    const copy = useCallback(
        async (text: string) => {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), feedbackMs);
        },
        [feedbackMs],
    );

    return { copied, copy } as const;
}
