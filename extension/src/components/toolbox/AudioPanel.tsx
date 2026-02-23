import { Volume2, VolumeX } from "lucide-react";

interface AudioPanelProps {
    audioEnabled: boolean;
    hasSilentPlaceholder: boolean;
    hasOutStream: boolean;
    onToggleAudio: () => void;
}

/** Tab audio controls with mute/unmute toggle and guidance text. */
export function AudioPanel({
    audioEnabled,
    hasSilentPlaceholder,
    hasOutStream,
    onToggleAudio,
}: AudioPanelProps) {
    return (
        <div className="rounded-2xl bg-zinc-950 border border-white/[0.07] p-4 space-y-3">
            <div className="flex items-center gap-2">
                {audioEnabled ? (
                    <Volume2 className="w-4 h-4 text-brand-400" aria-hidden="true" />
                ) : (
                    <VolumeX className="w-4 h-4 text-zinc-500" aria-hidden="true" />
                )}
                <h3 className="text-sm font-semibold text-white">Tab Audio</h3>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
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
                className={`w-full py-2 rounded-lg text-xs font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                    audioEnabled
                        ? "bg-brand-600/20 border border-brand-500/30 text-brand-300 hover:bg-brand-600/30"
                        : "bg-white/4 border border-white/8 text-zinc-400 hover:bg-white/8 hover:text-white"
                }`}
            >
                {audioEnabled ? "Mute Audio" : "Unmute Audio"}
            </button>
            <div className="text-[10px] text-zinc-700 leading-relaxed space-y-1">
                <p>
                    Enable &quot;Also share tab audio&quot; in the browser screen picker to share
                    tab sound.
                </p>
                <p className="text-yellow-500/80">
                    Note: Audio sharing only works while sharing browser tabs.
                </p>
            </div>
        </div>
    );
}
