import type { Quality, QualityConfig, StreamState } from "@/types";

/** Base URL for the viewer web app */
// export const APP_URL = "https://oculus-2-0-viewer.vercel.app";
export const APP_URL = "http://localhost:3000";

/** Viewer page base URL (alias for APP_URL) */
export const VIEWER_BASE_URL = APP_URL;

/** Quality preset configurations for screen capture and adaptive bitrate */
export const QUALITY_SETTINGS: Record<Quality, QualityConfig> = {
    "1080p": { width: 1920, height: 1080, frameRate: 30, maxBitrate: 8_000_000 },
    "720p": { width: 1280, height: 720, frameRate: 30, maxBitrate: 4_000_000 },
    "480p": { width: 854, height: 480, frameRate: 24, maxBitrate: 1_500_000 },
    "360p": { width: 640, height: 360, frameRate: 20, maxBitrate: 600_000 },
};

/** Quality options list for UI rendering */
export const QUALITY_OPTIONS: Quality[] = ["1080p", "720p", "480p", "360p"];

/** Human-readable bitrate labels per quality */
export const BITRATE_LABELS: Record<Quality, string> = {
    "1080p": "8",
    "720p": "4",
    "480p": "1.5",
    "360p": "0.6",
};

/** Stream state → status indicator color */
export const STATUS_COLORS: Record<StreamState, string> = {
    idle: "bg-zinc-600",
    requesting: "bg-yellow-500 animate-pulse",
    live: "bg-red-500 animate-pulse",
    stopped: "bg-zinc-600",
    error: "bg-red-700",
};

/** Stream state → human-readable label */
export const STATUS_LABELS: Record<StreamState, string> = {
    idle: "Idle",
    requesting: "Requesting…",
    live: "LIVE",
    stopped: "Stopped",
    error: "Error",
};
