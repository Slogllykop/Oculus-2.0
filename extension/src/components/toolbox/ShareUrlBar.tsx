import { Check, Copy } from "lucide-react";
import { useClipboard } from "@/hooks/useClipboard";

interface ShareUrlBarProps {
    url: string;
}

/** Share URL display with copy-to-clipboard button. */
export function ShareUrlBar({ url }: ShareUrlBarProps) {
    const { copied, copy } = useClipboard();

    if (!url) return null;

    return (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/3 border border-white/[0.07]">
            <span className="flex-1 text-xs text-zinc-400 truncate font-mono min-w-0">{url}</span>
            <button
                type="button"
                onClick={() => copy(url)}
                aria-label={copied ? "Link copied" : "Copy share link"}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
                {copied ? (
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                {copied ? "Copied!" : "Copy Link"}
            </button>
        </div>
    );
}
