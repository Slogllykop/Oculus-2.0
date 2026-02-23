import { Activity, Settings } from "lucide-react";
import { BITRATE_LABELS, QUALITY_OPTIONS } from "@/constants";
import type { Quality, StreamState } from "@/types";

interface QualityPanelProps {
    quality: Quality;
    streamState: StreamState;
    onChangeQuality: (q: Quality) => void;
}

/** Quality selector grid with adaptive bitrate info. */
export function QualityPanel({ quality, streamState, onChangeQuality }: QualityPanelProps) {
    return (
        <div className="rounded-2xl bg-zinc-950 border border-white/[0.07] p-4 space-y-3">
            <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-brand-400" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-white">Quality</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {QUALITY_OPTIONS.map((q) => (
                    <button
                        type="button"
                        key={q}
                        onClick={() => onChangeQuality(q)}
                        disabled={streamState !== "live" && streamState !== "idle"}
                        className={`py-2 rounded-lg text-xs font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                            quality === q
                                ? "bg-brand-600 text-white shadow-lg shadow-brand-900/30"
                                : "bg-white/4 border border-white/8 text-zinc-400 hover:bg-white/8 hover:text-white"
                        }`}
                    >
                        {q}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-1.5 pt-1">
                <Activity className="w-3 h-3 text-zinc-600" aria-hidden="true" />
                <p className="text-[10px] text-zinc-600">
                    Adaptive bitrate · up to {BITRATE_LABELS[quality]} Mbps
                </p>
            </div>
        </div>
    );
}
