import { Users } from "lucide-react";

interface ViewerCountCardProps {
    count: number;
}

export function ViewerCountCard({ count }: ViewerCountCardProps) {
    return (
        <div className="rounded-2xl bg-surface-2 border border-white/5 p-4 transition-colors hover:border-white/10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-zinc-400" aria-hidden="true" />
                    <span className="text-sm font-semibold text-white tracking-wide">Viewers</span>
                </div>
                <span className="text-3xl font-bold text-white tracking-tighter">{count}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
                <span
                    className={`w-1.5 h-1.5 rounded-full ${count > 0 ? "bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "bg-zinc-600"}`}
                    aria-hidden="true"
                />
                <p className="text-[11px] text-zinc-400 font-medium tracking-wide uppercase">
                    Active connections
                </p>
            </div>
        </div>
    );
}
