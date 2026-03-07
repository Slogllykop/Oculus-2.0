import { Gauge, Monitor, Zap } from "lucide-react";
import type { StreamQuality } from "@/hooks/useConnectionStats";

interface StreamQualityIndicatorProps {
    quality: StreamQuality;
}

/** Format bitrate for display: "— " / "1.2 Mbps" / "850 kbps" */
function formatBitrate(kbps: number): string {
    if (kbps < 0) return "—";
    if (kbps >= 1_000) return `${(kbps / 1_000).toFixed(1)} Mbps`;
    return `${kbps} kbps`;
}

/** Qualitative color class based on bitrate relative to a usable stream */
function bitrateColor(kbps: number): string {
    if (kbps < 0) return "text-zinc-500";
    if (kbps >= 2_000) return "text-accent-green-light";
    if (kbps >= 800) return "text-accent-amber-light";
    return "text-accent-red-light";
}

export function StreamQualityIndicator({ quality }: StreamQualityIndicatorProps) {
    const { frameWidth, frameHeight, fps, bitrateKbps } = quality;
    const hasData = frameWidth > 0 || frameHeight > 0 || fps > 0 || bitrateKbps > 0;

    return (
        <div className="rounded-2xl bg-surface-2 border border-white/5 p-4 space-y-3 transition-colors hover:border-white/10">
            <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-zinc-400" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-white tracking-wide">Stream Stats</h3>
            </div>

            {!hasData ? (
                <p className="text-xs text-zinc-500 font-medium">Waiting for outbound data…</p>
            ) : (
                <div className="grid grid-cols-3 gap-2">
                    {/* Resolution */}
                    <div className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl bg-white/3 border border-white/5">
                        <Monitor className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                        <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wide">
                            Res
                        </span>
                        <span className="text-xs font-bold text-white font-mono tabular-nums leading-tight">
                            {frameWidth > 0 && frameHeight > 0
                                ? `${frameWidth}×${frameHeight}`
                                : "—"}
                        </span>
                    </div>

                    {/* FPS */}
                    <div className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl bg-white/3 border border-white/5">
                        <Zap className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                        <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wide">
                            FPS
                        </span>
                        <span className="text-xs font-bold text-white font-mono tabular-nums leading-tight">
                            {fps > 0 ? fps : "—"}
                        </span>
                    </div>

                    {/* Bitrate */}
                    <div className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl bg-white/3 border border-white/5">
                        <Gauge className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                        <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-wide">
                            Rate
                        </span>
                        <span
                            className={`text-xs font-bold font-mono tabular-nums leading-tight ${bitrateColor(bitrateKbps)}`}
                        >
                            {formatBitrate(bitrateKbps)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
