import { Volume2, VolumeX } from "lucide-react";

interface AudioPanelProps {
    audioEnabled: boolean;
    hasSilentPlaceholder: boolean;
    hasOutStream: boolean;
    onToggleAudio: () => void;
}

export function AudioPanel({
    audioEnabled,
    hasSilentPlaceholder,
    hasOutStream,
    onToggleAudio,
}: AudioPanelProps) {
    return (
        <div className="rounded-2xl bg-surface-2 border border-white/5 p-4 space-y-4 transition-colors hover:border-white/10">
            <div className="flex items-center gap-2">
                {audioEnabled ? (
                    <Volume2 className="w-4 h-4 text-white" aria-hidden="true" />
                ) : (
                    <VolumeX className="w-4 h-4 text-zinc-500" aria-hidden="true" />
                )}
                <h3 className="text-sm font-semibold text-white tracking-wide">Tab Audio</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                {audioEnabled
                    ? "Tab audio is live - viewers can hear it."
                    : hasSilentPlaceholder
                      ? "No tab audio captured. Re-share screen & enable 'Also share tab audio'."
                      : "No audio source active."}
            </p>
            <button
                type="button"
                onClick={onToggleAudio}
                disabled={!hasOutStream || hasSilentPlaceholder}
                aria-label={audioEnabled ? "Mute tab audio" : "Unmute tab audio"}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-white/50 ${
                    audioEnabled
                        ? "bg-white/10 border border-white/10 text-white hover:bg-white/20"
                        : "bg-white/5 border border-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                }`}
            >
                {audioEnabled ? "Mute Audio" : "Unmute Audio"}
            </button>
            <div className="text-[10px] text-zinc-500 leading-relaxed space-y-1 font-medium">
                <p>
                    Enable &quot;Also share tab audio&quot; in the browser screen picker to share
                    tab sound.
                </p>
            </div>
        </div>
    );
}
