import { Signal, SignalHigh, SignalLow, SignalMedium } from "lucide-react";
import type { LatencyLevel } from "@/hooks/useConnectionStats";

interface LatencyIndicatorProps {
    latencyMs: number;
    latencyLevel: LatencyLevel;
}

const LEVEL_STYLES: Record<LatencyLevel, { text: string; dot: string; label: string }> = {
    good: {
        text: "text-accent-green-light",
        dot: "bg-accent-green shadow-[0_0_10px_rgba(16,185,129,0.6)]",
        label: "Excellent",
    },
    moderate: {
        text: "text-accent-amber-light",
        dot: "bg-accent-amber shadow-[0_0_10px_rgba(245,158,11,0.6)]",
        label: "Fair",
    },
    poor: {
        text: "text-accent-red-light",
        dot: "bg-accent-red shadow-[0_0_10px_rgba(239,68,68,0.6)]",
        label: "Poor",
    },
};

const LEVEL_ICON: Record<LatencyLevel, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    good: SignalHigh,
    moderate: SignalMedium,
    poor: SignalLow,
};

export function LatencyIndicator({ latencyMs, latencyLevel }: LatencyIndicatorProps) {
    const style = LEVEL_STYLES[latencyLevel];
    const Icon = latencyMs < 0 ? Signal : LEVEL_ICON[latencyLevel];

    return (
        <div className="rounded-2xl bg-surface-2 border border-white/5 p-4 transition-colors hover:border-white/10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon
                        className={`w-4 h-4 ${latencyMs < 0 ? "text-zinc-500" : style.text}`}
                        aria-hidden="true"
                    />
                    <span className="text-sm font-semibold text-white tracking-wide">Latency</span>
                </div>
                <span
                    className={`text-2xl font-bold tracking-tighter font-mono tabular-nums ${
                        latencyMs < 0 ? "text-zinc-500" : style.text
                    }`}
                >
                    {latencyMs < 0 ? "—" : `${latencyMs}ms`}
                </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
                <span
                    className={`w-1.5 h-1.5 rounded-full ${
                        latencyMs < 0 ? "bg-zinc-600" : `${style.dot} animate-pulse`
                    }`}
                    aria-hidden="true"
                />
                <p className="text-[11px] text-zinc-400 font-medium tracking-wide uppercase">
                    {latencyMs < 0 ? "Waiting for viewers" : `${style.label} · Avg RTT`}
                </p>
            </div>
        </div>
    );
}
