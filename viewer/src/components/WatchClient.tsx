"use client";

import {
	AlertCircle,
	Loader2,
	Maximize2,
	Monitor,
	Radio,
	RefreshCw,
	Volume2,
	VolumeX,
	Wifi,
	WifiOff,
} from "lucide-react";
import Peer from "peerjs";
import { useCallback, useEffect, useRef, useState } from "react";

type ViewState =
	| "connecting"
	| "waiting"
	| "streaming"
	| "disconnected"
	| "error";

interface Props {
	sessionId: string;
}

export default function WatchClient({ sessionId }: Props) {
	const [viewState, setViewState] = useState<ViewState>("connecting");
	const setViewStateSync = (s: ViewState) => {
		viewStateRef.current = s;
		setViewState(s);
	};
	const [muted, setMuted] = useState(true);
	const [errorMsg, setErrorMsg] = useState("");
	const [retryCount, setRetryCount] = useState(0);
	const [showControls, setShowControls] = useState(true);

	const videoRef = useRef<HTMLVideoElement>(null);
	const peerRef = useRef<Peer | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const viewStateRef = useRef<ViewState>("connecting");

	const connect = useCallback(() => {
		if (peerRef.current) {
			peerRef.current.destroy();
			peerRef.current = null;
		}

		const broadcasterId = `oculus-host-${sessionId}`;

		const peer = new Peer(
			//     {
			// 	host: "0.peerjs.com",
			// 	port: 443,
			// 	secure: true,
			// 	path: "/",
			// 	config: {
			// 		iceServers: [
			// 			{ urls: "stun:stun.l.google.com:19302" },
			// 			{ urls: "stun:stun1.l.google.com:19302" },
			// 			{ urls: "stun:global.stun.twilio.com:3478" },
			// 		],
			// 	},
			// }
		);

		peerRef.current = peer;

		peer.on("open", () => {
			setViewStateSync("waiting");
			// Announce ourselves to the broadcaster via a data connection.
			// The broadcaster will call us back with the media stream.
			const dataConn = peer.connect(broadcasterId, { reliable: true });
			// Do NOT retry on data connection error - the broadcaster may call
			// us back slightly after the data channel opens. Premature retry
			// would destroy the peer before the incoming call arrives.
			dataConn.on("error", (err) => {
				console.warn("Data connection error:", err);
			});
		});

		// Broadcaster calls us back with the stream
		peer.on("call", (call) => {
			// Answer with no outgoing stream - viewer only receives
			call.answer();

			call.on("stream", (remoteStream) => {
				const video = videoRef.current;
				if (video) {
					video.srcObject = remoteStream;
					// Start muted to satisfy browser autoplay policy,
					// then play. The UI mute button lets the user unmute.
					video.muted = true;
					video.play().catch((e) => {
						console.warn("Autoplay failed:", e);
					});
				}
				setMuted(true);
				setViewStateSync("streaming");
			});

			call.on("close", () => setViewStateSync("disconnected"));
			call.on("error", () => setViewStateSync("disconnected"));
		});

		peer.on("error", (err) => {
			if (err.type === "peer-unavailable") {
				setViewStateSync("waiting");
				scheduleRetry();
			} else {
				setErrorMsg(`Connection error: ${err.message}`);
				setViewStateSync("error");
			}
		});

		peer.on("disconnected", () => {
			// Only retry if we are not already streaming - a "disconnected"
			// event during an active stream is a signalling-server blip and
			// can often be recovered with reconnect() rather than a full
			// peer rebuild.
			if (viewStateRef.current !== "streaming") {
				scheduleRetry();
			} else {
				// Try to reconnect to the signalling server without destroying
				// the existing media connection.
				try {
					peer.reconnect();
				} catch {
					scheduleRetry();
				}
			}
		});
	}, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

	const scheduleRetry = useCallback(() => {
		if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
		retryTimerRef.current = setTimeout(() => {
			setRetryCount((c) => c + 1);
		}, 3000);
	}, []);

	useEffect(() => {
		connect();
		return () => {
			if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
			peerRef.current?.destroy();
		};
	}, [retryCount]); // eslint-disable-line react-hooks/exhaustive-deps

	// Auto-hide controls during streaming
	useEffect(() => {
		if (viewState !== "streaming") {
			setShowControls(true);
			return;
		}
		const resetTimer = () => {
			setShowControls(true);
			if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
			controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
		};
		const container = containerRef.current;
		container?.addEventListener("mousemove", resetTimer);
		container?.addEventListener("touchstart", resetTimer);
		resetTimer();
		return () => {
			container?.removeEventListener("mousemove", resetTimer);
			container?.removeEventListener("touchstart", resetTimer);
			if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
		};
	}, [viewState]);

	const toggleFullscreen = () => {
		if (!containerRef.current) return;
		if (!document.fullscreenElement) {
			containerRef.current.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	};

	const toggleMute = () => {
		if (videoRef.current) {
			const next = !videoRef.current.muted;
			videoRef.current.muted = next;
			setMuted(next);
		}
	};

	const retry = () => {
		setViewStateSync("connecting");
		setErrorMsg("");
		if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
		setRetryCount((c) => c + 1);
	};

	return (
		<div className="min-h-screen bg-black flex flex-col">
			{/* Header */}
			<header className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm">
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
						<Monitor className="w-4 h-4 text-white" />
					</div>
					<div>
						<h1 className="text-sm font-bold text-white tracking-wide">
							Oculus
						</h1>
						<p className="text-xs text-zinc-500 font-mono truncate max-w-[200px]">
							{sessionId.slice(0, 8)}...
						</p>
					</div>
				</div>

				<div className="flex items-center gap-3">
					{viewState === "streaming" && (
						<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
							<span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
							<span className="text-xs font-semibold text-red-400">LIVE</span>
						</div>
					)}
					{viewState === "waiting" && (
						<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
							<Loader2 className="w-3 h-3 text-yellow-400 animate-spin" />
							<span className="text-xs text-yellow-400">
								Waiting for broadcaster
							</span>
						</div>
					)}
					{viewState === "connecting" && (
						<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08]">
							<Loader2 className="w-3 h-3 text-zinc-400 animate-spin" />
							<span className="text-xs text-zinc-400">Connecting...</span>
						</div>
					)}
					{viewState === "disconnected" && (
						<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.07]">
							<WifiOff className="w-3 h-3 text-zinc-500" />
							<span className="text-xs text-zinc-500">Stream ended</span>
						</div>
					)}
				</div>
			</header>

			{/* Main */}
			<main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 gap-6">
				{/* Video Container */}
				<div
					ref={containerRef}
					className="relative w-full max-w-6xl rounded-2xl overflow-hidden bg-zinc-950 border border-white/[0.07] shadow-2xl shadow-black/80 aspect-video"
					style={{
						cursor:
							showControls || viewState !== "streaming" ? "default" : "none",
					}}
				>
					<video
						ref={videoRef}
						autoPlay
						playsInline
						muted={muted}
						className={`w-full h-full object-contain transition-opacity duration-300 ${
							viewState === "streaming" ? "opacity-100" : "opacity-0"
						}`}
					/>

					{/* Overlay for non-streaming states */}
					{viewState !== "streaming" && (
						<div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
							{viewState === "connecting" && (
								<>
									<div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
										<Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
									</div>
									<div className="text-center">
										<p className="text-white font-semibold">
											Connecting to stream...
										</p>
										<p className="text-sm text-zinc-500 mt-1">
											Setting up peer connection
										</p>
									</div>
								</>
							)}

							{viewState === "waiting" && (
								<>
									<div className="relative">
										<div className="w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
											<Radio className="w-8 h-8 text-brand-400" />
										</div>
										<span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-400 animate-ping opacity-75" />
										<span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-400" />
									</div>
									<div className="text-center">
										<p className="text-white font-semibold">
											Waiting for broadcaster
										</p>
										<p className="text-sm text-zinc-500 mt-1">
											Stream will start automatically when the broadcaster goes
											live
										</p>
										<div className="flex items-center justify-center gap-2 mt-3">
											<Loader2 className="w-3.5 h-3.5 text-zinc-600 animate-spin" />
											<span className="text-xs text-zinc-600">
												Retrying... (attempt {retryCount + 1})
											</span>
										</div>
									</div>
								</>
							)}

							{viewState === "disconnected" && (
								<>
									<div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
										<WifiOff className="w-8 h-8 text-zinc-600" />
									</div>
									<div className="text-center">
										<p className="text-white font-semibold">Stream ended</p>
										<p className="text-sm text-zinc-500 mt-1">
											The broadcaster has stopped sharing
										</p>
										<button
											type="button"
											onClick={retry}
											className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-sm hover:bg-white/[0.07] transition-colors mx-auto"
										>
											<RefreshCw className="w-3.5 h-3.5" />
											Try reconnecting
										</button>
									</div>
								</>
							)}

							{viewState === "error" && (
								<>
									<div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
										<AlertCircle className="w-8 h-8 text-red-400" />
									</div>
									<div className="text-center">
										<p className="text-white font-semibold">
											Connection failed
										</p>
										<p className="text-sm text-zinc-500 mt-1">
											{errorMsg || "Unable to connect to stream"}
										</p>
										<button
											type="button"
											onClick={retry}
											className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors mx-auto"
										>
											<RefreshCw className="w-3.5 h-3.5" />
											Retry
										</button>
									</div>
								</>
							)}
						</div>
					)}

					{/* Streaming controls overlay */}
					{viewState === "streaming" && (
						<>
							<div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/90 backdrop-blur-sm">
								<span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
								<span className="text-xs font-bold text-white">LIVE</span>
							</div>

							<div
								className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
									showControls
										? "opacity-100 translate-y-0"
										: "opacity-0 translate-y-2"
								}`}
							>
								<div className="bg-gradient-to-t from-black/90 to-transparent p-4 flex items-center justify-between">
									<button
										type="button"
										onClick={toggleMute}
										className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm border border-white/10"
										title={muted ? "Unmute" : "Mute"}
									>
										{muted ? (
											<VolumeX className="w-5 h-5" />
										) : (
											<Volume2 className="w-5 h-5" />
										)}
									</button>
									<button
										type="button"
										onClick={toggleFullscreen}
										className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-sm border border-white/10"
										title="Fullscreen"
									>
										<Maximize2 className="w-5 h-5" />
									</button>
								</div>
							</div>
						</>
					)}
				</div>

				{/* Info bar */}
				<div className="w-full max-w-6xl flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
					<div className="flex items-center gap-2">
						{viewState === "streaming" ? (
							<Wifi className="w-4 h-4 text-brand-400" />
						) : (
							<WifiOff className="w-4 h-4 text-zinc-600" />
						)}
						<span className="text-sm text-zinc-400">
							{viewState === "streaming"
								? "Stream connected - watching live"
								: viewState === "waiting"
									? "Waiting for broadcast to start..."
									: viewState === "connecting"
										? "Establishing connection..."
										: viewState === "disconnected"
											? "Stream has ended"
											: "Connection failed"}
						</span>
					</div>
					<div className="flex items-center gap-2 text-xs text-zinc-700">
						<Monitor className="w-3.5 h-3.5" />
						<span>P2P · End-to-end</span>
					</div>
				</div>

				{viewState === "waiting" && (
					<p className="text-sm text-zinc-600 text-center max-w-md">
						Share this page URL with others so they can watch the stream too.
						The stream will begin as soon as the broadcaster starts sharing.
					</p>
				)}
			</main>
		</div>
	);
}
