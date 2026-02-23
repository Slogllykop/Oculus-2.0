/** Supported broadcast quality presets */
export type Quality = "1080p" | "720p" | "480p" | "360p";

/** Quality preset configuration */
export interface QualityConfig {
    width: number;
    height: number;
    frameRate: number;
    maxBitrate: number;
}

/** Toolbox stream lifecycle states */
export type StreamState = "idle" | "requesting" | "live" | "stopped" | "error";

/** Popup app states */
export type AppState = "idle" | "broadcasting" | "error";

/** Chrome runtime message types */
export type MessageType = "START_BROADCAST" | "STOP_BROADCAST" | "GET_SESSION" | "FOCUS_TOOLBOX";
