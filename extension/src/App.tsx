import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Monitor, Radio, ExternalLink } from "lucide-react";

const VIEWER_BASE_URL = "http://localhost:3000"; // Change to production URL when deployed

type State = "idle" | "broadcasting" | "error";

export default function App() {
  const [state, setState] = useState<State>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if already broadcasting
    chrome.runtime.sendMessage({ type: "GET_SESSION" }, (res) => {
      if (res?.sessionId) {
        setSessionId(res.sessionId);
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
          setSessionId(id);
          setShareUrl(`${VIEWER_BASE_URL}/watch/${id}`);
          setState("broadcasting");
        } else {
          setError("Failed to start broadcast");
          setState("error");
        }
      });
    } catch (e) {
      setError("Failed to start broadcast");
      setState("error");
    }
  };

  const stopBroadcast = () => {
    chrome.runtime.sendMessage({ type: "STOP_BROADCAST" }, () => {
      setState("idle");
      setSessionId(null);
      setShareUrl("");
    });
  };

  const focusToolbox = () => {
    chrome.runtime.sendMessage({ type: "FOCUS_TOOLBOX" });
  };

  const copyUrl = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-80 min-h-[400px] bg-gray-950 text-gray-100 font-sans flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
          <Monitor className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white">Oculus</h1>
          <p className="text-xs text-gray-500">Screen Broadcasting</p>
        </div>
        {state === "broadcasting" && (
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-red-400 font-medium">LIVE</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-6 gap-5">
        {state === "idle" && (
          <>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <Monitor className="w-8 h-8 text-brand-400" />
              </div>
              <h2 className="text-base font-semibold text-white">Start Sharing</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                Share your screen with anyone in the world. Click below to generate a shareable link.
              </p>
            </div>
            <button
              onClick={startBroadcast}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-brand-900/40 hover:shadow-brand-900/60 hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Sharing
            </button>
          </>
        )}

        {state === "broadcasting" && (
          <>
            <div className="w-full space-y-4">
              <div className="flex items-center gap-2 text-center justify-center">
                <Radio className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-white">Broadcasting Live</span>
              </div>

              {/* Share URL */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Share Link</p>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="flex-1 text-xs text-gray-300 truncate font-mono">{shareUrl}</span>
                  <button
                    onClick={copyUrl}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-colors"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={focusToolbox}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-xs font-medium transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Toolbox
                </button>
                <button
                  onClick={stopBroadcast}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors"
                >
                  Stop Stream
                </button>
              </div>

              <a
                href={shareUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-2 text-xs text-brand-400 hover:text-brand-300 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Preview viewer page
              </a>
            </div>
          </>
        )}

        {state === "error" && (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
              <span className="text-red-400 text-xl">!</span>
            </div>
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={() => setState("idle")}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-xs hover:bg-white/10 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-gray-600">P2P · Secure · No Servers</span>
        <span className="text-xs text-gray-600">v1.0.0</span>
      </div>
    </div>
  );
}
