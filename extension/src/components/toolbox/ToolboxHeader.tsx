import { Users } from "lucide-react";
import { STATUS_COLORS, STATUS_LABELS } from "@/constants";
import type { StreamState } from "@/types";

interface ToolboxHeaderProps {
    streamState: StreamState;
    viewerCount: number;
}

/** Sticky top bar with branding, stream status pill, and viewer count badge. */
export function ToolboxHeader({ streamState, viewerCount }: ToolboxHeaderProps) {
    return (
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-surface-1/80 backdrop-blur-md sticky top-0 z-10 animate-fade-in shadow-xl">
            <div className="flex items-center gap-3">
                <img src="/icon500.png" alt="Oculus Logo" className="w-8 h-8 object-contain" />
                <div>
                    <h1 className="text-sm font-bold text-white tracking-wide">Oculus</h1>
                    <p className="text-xs text-zinc-500 font-medium tracking-wide">
                        Broadcaster Control
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-2 border border-white/5 shadow-inner">
                    <span
                        className={`w-2 h-2 rounded-full ${STATUS_COLORS[streamState]}`}
                        aria-hidden="true"
                    />
                    <span className="text-xs font-bold tracking-wide text-zinc-300">
                        {STATUS_LABELS[streamState]}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-2 border border-white/5 shadow-inner">
                    <Users className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
                    <span className="text-xs font-bold tracking-wide text-zinc-300">
                        {viewerCount}
                    </span>
                </div>
            </div>
        </header>
    );
}
