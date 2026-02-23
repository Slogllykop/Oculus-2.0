import { Check, Copy, ExternalLink, Monitor, Radio } from "lucide-react";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { VIEWER_BASE_URL } from "./constants";
import { useClipboard } from "./hooks/useClipboard";

type State = "idle" | "broadcasting" | "error";

export default function App() {
    const [state, setState] = useState<State>("idle");
    const [shareUrl, setShareUrl] = useState<string>("");
    const [error, setError] = useState("");
    const { copied, copy } = useClipboard();

    useEffect(() => {
        chrome.runtime.sendMessage({ type: "GET_SESSION" }, (res) => {
            if (res?.sessionId) {
                setShareUrl(`${VIEWER_BASE_URL}/watch/${res.sessionId}`);
                setState("broadcasting");
            }
        });
    }, []);

    const startBroadcast = async () => {
        try {
            const id = uuidv4();
            chrome.runtime.sendMessage({ type: "START_BROADCAST", sessionId: id }, (res) => {
                if (res?.success) {
                    setShareUrl(`${VIEWER_BASE_URL}/watch/${id}`);
                    setState("broadcasting");
                } else {
                    setError("Failed to start broadcast");
                    setState("error");
                }
            });
        } catch {
            setError("Failed to start broadcast");
            setState("error");
        }
    };

    const stopBroadcast = () => {
        chrome.runtime.sendMessage({ type: "STOP_BROADCAST" }, () => {
            setState("idle");
            setShareUrl("");
        });
    };

    const focusToolbox = () => {
        chrome.runtime.sendMessage({ type: "FOCUS_TOOLBOX" });
    };

    return (
        <div className="w-80 min-h-[400px] bg-surface-0 text-white font-sans flex flex-col relative overflow-hidden">
            {/* Background orbs */}
            <div
                className="absolute top-0 -left-1/4 w-40 h-40 rounded-full bg-accent-blue/4 blur-2xl pointer-events-none animate-float"
                aria-hidden="true"
            />
            <div
                className="absolute bottom-0 -right-1/4 w-40 h-40 rounded-full bg-accent-violet/4 blur-2xl pointer-events-none animate-float"
                style={{ animationDelay: "2s" }}
                aria-hidden="true"
            />

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/6 relative z-10 animate-fade-in">
                <img src="/icon500.png" alt="Oculus Logo" className="w-8 h-8 object-contain" />
                <div>
                    <h1 className="text-sm font-bold text-white tracking-wide">Oculus</h1>
                    <p className="text-xs text-zinc-500 font-medium">Screen Broadcasting</p>
                </div>
                {state === "broadcasting" && (
                    <div className="ml-auto flex items-center gap-1.5">
                        <span
                            className="w-2 h-2 rounded-full bg-accent-red animate-pulse"
                            aria-hidden="true"
                        />
                        <span className="text-xs text-accent-red-light font-bold tracking-wide">
                            LIVE
                        </span>
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="flex-1 flex flex-col items-center justify-center px-5 py-6 gap-6 relative z-10">
                {state === "idle" && (
                    <>
                        <div
                            className="text-center space-y-3 animate-slide-up"
                            style={{ animationDelay: "0.1s" }}
                        >
                            <div className="w-16 h-16 rounded-2xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center mx-auto mb-2">
                                <Monitor className="w-8 h-8 text-accent-blue" aria-hidden="true" />
                            </div>
                            <h2 className="text-xl font-bold text-white tracking-tight">
                                Start Sharing
                            </h2>
                            <p className="text-xs text-zinc-400 leading-relaxed max-w-[240px] mx-auto">
                                Share your screen with anyone in the world. Click below to generate
                                a shareable link.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={startBroadcast}
                            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black text-sm font-bold transition-all duration-300 shadow-[0_0_40px_rgba(59,130,246,0.15)] hover:shadow-[0_0_60px_rgba(59,130,246,0.25)] hover:scale-[1.03] active:scale-[0.98] cursor-pointer focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 focus-visible:ring-offset-black animate-slide-up"
                            style={{ animationDelay: "0.2s" }}
                        >
                            Start Sharing
                        </button>
                    </>
                )}

                {state === "broadcasting" && (
                    <div className="w-full space-y-5 animate-fade-in">
                        <div className="flex items-center gap-2 justify-center">
                            <Radio className="w-4 h-4 text-accent-red" aria-hidden="true" />
                            <span className="text-sm font-bold text-white tracking-tight">
                                Broadcasting Live
                            </span>
                        </div>

                        {/* Share URL */}
                        <div className="space-y-2">
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                Share Link
                            </p>
                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-2 border border-white/8 shadow-inner">
                                <span className="flex-1 text-xs text-zinc-300 truncate font-mono min-w-0 px-1">
                                    {shareUrl}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => copy(shareUrl)}
                                    aria-label={copied ? "Link copied" : "Copy share link"}
                                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-blue hover:bg-accent-blue-light text-white text-xs font-bold transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-accent-blue"
                                >
                                    {copied ? (
                                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                    ) : (
                                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                                    )}
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2.5">
                            <button
                                type="button"
                                onClick={focusToolbox}
                                aria-label="Open broadcaster toolbox"
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/5 border border-white/8 hover:bg-white/10 text-white text-xs font-semibold transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-accent-blue"
                            >
                                <ExternalLink
                                    className="w-3.5 h-3.5 text-zinc-400"
                                    aria-hidden="true"
                                />
                                Open Toolbox
                            </button>
                            <button
                                type="button"
                                onClick={stopBroadcast}
                                className="flex-1 py-2.5 px-3 rounded-xl bg-accent-red/10 border border-accent-red/20 hover:bg-accent-red/20 text-accent-red-light text-xs font-semibold shadow-[0_0_20px_rgba(239,68,68,0.1)] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-accent-red"
                            >
                                Stop Stream
                            </button>
                        </div>

                        <a
                            href={shareUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-medium text-accent-blue hover:text-accent-blue-light transition-colors focus-visible:ring-2 focus-visible:ring-accent-blue rounded-lg"
                        >
                            <ExternalLink className="w-3 h-3" aria-hidden="true" />
                            Preview viewer page
                        </a>
                    </div>
                )}

                {state === "error" && (
                    <div className="text-center space-y-4 animate-fade-in">
                        <div className="w-12 h-12 rounded-full bg-accent-red/10 border border-accent-red/20 flex items-center justify-center mx-auto">
                            <span className="text-accent-red text-xl font-bold" aria-hidden="true">
                                !
                            </span>
                        </div>
                        <p className="text-sm font-medium text-accent-red-light">{error}</p>
                        <button
                            type="button"
                            onClick={() => setState("idle")}
                            className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/8 text-white text-xs font-semibold hover:bg-white/10 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-accent-blue"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/4 flex items-center justify-between relative z-10">
                <span className="text-xs text-zinc-600 font-medium">P2P · Secure · No Servers</span>
                <span className="text-xs text-zinc-600 font-mono font-medium">v1.3.0</span>
            </div>
        </div>
    );
}
