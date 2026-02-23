import { Users } from "lucide-react";

interface ViewerCountCardProps {
    count: number;
}

/** Compact card displaying the active viewer/connection count. */
export function ViewerCountCard({ count }: ViewerCountCardProps) {
    return (
        <div className="rounded-2xl bg-zinc-950 border border-white/[0.07] p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-400" aria-hidden="true" />
                    <span className="text-sm font-semibold text-white">Viewers</span>
                </div>
                <span className="text-2xl font-bold text-white">{count}</span>
            </div>
            <p className="text-xs text-zinc-600 mt-1">Active connections</p>
        </div>
    );
}
