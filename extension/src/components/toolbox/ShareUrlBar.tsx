import { Check, Copy } from "lucide-react";
import { useClipboard } from "@/hooks/useClipboard";

interface ShareUrlBarProps {
    url: string;
}

export function ShareUrlBar({ url }: ShareUrlBarProps) {
    const { copied, copy } = useClipboard();

    if (!url) return null;

    return (
        <div className="flex items-center justify-between p-2 rounded-2xl bg-surface-2 border border-white/5 transition-colors hover:border-white/10 shadow-xl">
            <div className="flex-1 truncate px-3">
                <span className="text-[13px] text-zinc-400 font-mono tracking-wide">{url}</span>
            </div>
            <button
                type="button"
                onClick={() => copy(url)}
                aria-label={copied ? "Link copied" : "Copy share link"}
                className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-100 text-xs font-bold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-white/50 shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-[0.98]"
            >
                {copied ? (
                    <Check className="w-4 h-4" aria-hidden="true" />
                ) : (
                    <Copy className="w-4 h-4" aria-hidden="true" />
                )}
                {copied ? "Copied" : "Copy Link"}
            </button>
        </div>
    );
}
