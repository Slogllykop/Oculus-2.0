import { Activity, Settings } from "lucide-react";
import { BITRATE_LABELS, QUALITY_OPTIONS } from "@/constants";
import type { Quality, StreamState } from "@/types";

interface QualityPanelProps {
    quality: Quality;
    streamState: StreamState;
    onChangeQuality: (q: Quality) => void;
}

export function QualityPanel({ quality, streamState, onChangeQuality }: QualityPanelProps) {
    return (
        <div className="rounded-2xl bg-surface-2 border border-white/5 p-4 space-y-4 transition-colors hover:border-white/10">
            <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-zinc-400" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-white tracking-wide">Quality</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {QUALITY_OPTIONS.map((q) => (
                    <button
                        type="button"
                        key={q}
                        onClick={() => onChangeQuality(q)}
                        disabled={streamState !== "live" && streamState !== "idle"}
                        className={`py-2.5 rounded-xl text-xs flex items-center justify-center font-bold font-mono transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-white/50 ${
                            quality === q
                                ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)] scale-[1.02]"
                                : "bg-white/5 border border-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                        {q}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-1.5 pt-1">
                <Activity className="w-3.5 h-3.5 text-zinc-600" aria-hidden="true" />
                <p className="text-[11px] text-zinc-500 font-medium">
                    Adaptive bitrate · up to {BITRATE_LABELS[quality]} Mbps
                </p>
            </div>
        </div>
    );
}
