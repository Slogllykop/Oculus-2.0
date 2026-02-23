import {
    ArrowRight,
    Chrome,
    Globe,
    Lock,
    Monitor,
    MousePointerClick,
    Send,
    Shield,
    Zap,
} from "lucide-react";
import Image from "next/image";

const FEATURES = [
    {
        icon: Zap,
        title: "Instant Sharing",
        desc: "One click to start. Get a shareable URL immediately - no sign-up, no installation prompts.",
        color: "amber",
    },
    {
        icon: Globe,
        title: "Watch Anywhere",
        desc: "Viewers join from any device, any browser, any OS. Just open the link.",
        color: "blue",
    },
    {
        icon: Shield,
        title: "Private by Default",
        desc: "Direct peer-to-peer connections. No servers see your screen - only people with your link.",
        color: "green",
    },
    {
        icon: Zap,
        title: "Zero Latency",
        desc: "WebRTC-powered streaming delivers frames in real-time. No buffering, no delay.",
        color: "violet",
    },
] as const;

const STEPS = [
    {
        num: "01",
        title: "Install the Extension",
        desc: "Add Oculus to Chrome in one click. It's lightweight and stays out of your way.",
        color: "blue",
    },
    {
        num: "02",
        title: "Click Start Sharing",
        desc: "Choose a tab, window, or your entire screen. Broadcasting begins instantly.",
        color: "green",
    },
    {
        num: "03",
        title: "Share the Link",
        desc: "Copy your unique viewer URL and send it to anyone. They'll see your screen live.",
        color: "amber",
    },
] as const;

const TRUST_ITEMS = [
    { icon: Shield, label: "Zero Data Collection", color: "blue" },
    { icon: Globe, label: "Open Source", color: "violet" },
    { icon: Zap, label: "No Servers", color: "amber" },
] as const;

const ACCENT_MAP: Record<string, { text: string; bg: string; border: string; glow: string }> = {
    blue: {
        text: "text-accent-blue",
        bg: "bg-accent-blue/10",
        border: "border-accent-blue/20",
        glow: "group-hover:shadow-accent-blue/10",
    },
    green: {
        text: "text-accent-green",
        bg: "bg-accent-green/10",
        border: "border-accent-green/20",
        glow: "group-hover:shadow-accent-green/10",
    },
    amber: {
        text: "text-accent-amber",
        bg: "bg-accent-amber/10",
        border: "border-accent-amber/20",
        glow: "group-hover:shadow-accent-amber/10",
    },
    violet: {
        text: "text-accent-violet",
        bg: "bg-accent-violet/10",
        border: "border-accent-violet/20",
        glow: "group-hover:shadow-accent-violet/10",
    },
    red: {
        text: "text-accent-red",
        bg: "bg-accent-red/10",
        border: "border-accent-red/20",
        glow: "group-hover:shadow-accent-red/10",
    },
    rose: {
        text: "text-accent-rose",
        bg: "bg-accent-rose/10",
        border: "border-accent-rose/20",
        glow: "group-hover:shadow-accent-rose/10",
    },
};

export default function Home() {
    return (
        <main className="min-h-screen bg-surface-0 flex flex-col relative overflow-hidden">
            {/* ─── Nav ──────────────────────────────────────────── */}
            <nav className="flex items-center justify-between px-8 py-5 border-b border-white/6 animate-fade-in relative z-10">
                <div className="flex items-center gap-3">
                    <Image
                        src="/icon500.png"
                        alt="Oculus Logo"
                        width={36}
                        height={36}
                        className="w-9 h-9 object-contain"
                    />
                    <span className="text-lg font-bold text-white tracking-wide">Oculus</span>
                </div>
                <a
                    href="https://chromewebstore.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold transition-all hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                    <Chrome className="w-4 h-4" aria-hidden="true" />
                    Add to Chrome
                </a>
            </nav>

            {/* ─── Hero ─────────────────────────────────────────── */}
            <section className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pbbg-accent-violet/4e">
                {/* Background orbs - multi-color */}
                <div
                    className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-accent-blue/4 blur-[150px] pointer-events-none animate-float"
                    aria-hidden="true"
                />
                <div
                    className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-accent-violet/4 blur-[130px] pointer-events-none animate-float"
                    style={{ animationDelay: "2s" }}
                    aria-hidden="true"
                />
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-accent-green/3 blur-[160px] pointer-events-none"
                    aria-hidden="true"
                />

                <div className="relative space-y-8 max-w-4xl flex flex-col items-center">
                    {/* Badge */}
                    <div
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/8 text-zinc-400 text-xs font-medium animate-fade-in"
                        style={{ animationDelay: "0.1s" }}
                    >
                        <span
                            className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse"
                            aria-hidden="true"
                        />
                        Peer-to-peer · Zero latency · No accounts
                    </div>

                    {/* Heading */}
                    <h1
                        className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] tracking-tight animate-slide-up text-center"
                        style={{ animationDelay: "0.2s", textWrap: "balance" as never }}
                    >
                        Screen sharing
                        <br />
                        <span className="relative">
                            lives in your{" "}
                            <span className="relative inline-block">
                                <span className="bg-linear-to-r from-accent-blue via-accent-violet to-accent-rose bg-clip-text text-transparent">
                                    browser
                                </span>
                                <span
                                    className="absolute -bottom-2 left-0 right-0 h-[3px] bg-linear-to-r from-accent-blue via-accent-violet to-accent-rose rounded-full opacity-60"
                                    aria-hidden="true"
                                />
                            </span>
                        </span>
                    </h1>

                    {/* Subheading */}
                    <p
                        className="text-lg text-center md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed animate-slide-up"
                        style={{ animationDelay: "0.35s" }}
                    >
                        No downloads. No sign-ups. No servers standing between you and your viewer.
                        Just click <strong className="text-white">Start Sharing</strong> and send
                        the link.
                    </p>

                    {/* CTA */}
                    <div
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 animate-slide-up"
                        style={{ animationDelay: "0.5s" }}
                    >
                        <a
                            href="https://chromewebstore.google.com"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white text-black font-bold text-base transition-all shadow-[0_0_40px_rgba(59,130,246,0.15)] hover:shadow-[0_0_60px_rgba(59,130,246,0.25)] hover:scale-[1.03] active:scale-[0.98] cursor-pointer focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        >
                            <Chrome className="w-5 h-5" aria-hidden="true" />
                            Get Oculus for Chrome
                            <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        </a>
                    </div>
                </div>

                {/* ─── Browser Mockup ──────────────────────────── */}
                <div
                    className="relative mt-20 max-w-4xl w-full animate-scale-in"
                    style={{ animationDelay: "0.6s" }}
                >
                    <div className="rounded-2xl border border-white/8 bg-surface-2 overflow-hidden shadow-2xl shadow-black/60">
                        {/* Browser chrome */}
                        <div className="flex items-center gap-2 px-4 py-3 bg-surface-3 border-b border-white/6">
                            <div className="flex items-center gap-1.5">
                                <span
                                    className="w-3 h-3 rounded-full bg-accent-red/60"
                                    aria-hidden="true"
                                />
                                <span
                                    className="w-3 h-3 rounded-full bg-accent-amber/60"
                                    aria-hidden="true"
                                />
                                <span
                                    className="w-3 h-3 rounded-full bg-accent-green/60"
                                    aria-hidden="true"
                                />
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="flex items-center gap-2 px-4 py-1 rounded-lg bg-white/4 border border-white/6 text-xs text-zinc-500 font-mono">
                                    <Lock
                                        className="w-3 h-3 text-accent-green"
                                        aria-hidden="true"
                                    />
                                    oculus.isdevs.cv/watch/a3f8...
                                </div>
                            </div>
                            <div className="w-[52px]" />
                        </div>
                        {/* Screen content mockup */}
                        <div className="aspect-video bg-linear-to-br from-surface-1 via-surface-2 to-surface-3 flex items-center justify-center relative">
                            {/* Decorative grid */}
                            <div
                                className="absolute inset-0 opacity-[0.03]"
                                style={{
                                    backgroundImage:
                                        "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                                    backgroundSize: "60px 60px",
                                }}
                                aria-hidden="true"
                            />
                            {/* Center content */}
                            <div className="text-center space-y-4 relative">
                                <div className="w-20 h-20 rounded-3xl bg-white/4 border border-white/8 flex items-center justify-center mx-auto">
                                    <Monitor
                                        className="w-10 h-10 text-zinc-600"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-zinc-500">
                                        Your screen appears here
                                    </p>
                                    <p className="text-xs text-zinc-700">
                                        Live to anyone with the link
                                    </p>
                                </div>
                            </div>
                            {/* LIVE badge */}
                            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-red/90">
                                <span
                                    className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"
                                    aria-hidden="true"
                                />
                                <span className="text-xs font-bold text-white">LIVE</span>
                            </div>
                            {/* Viewer count */}
                            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/6 border border-white/8">
                                <span className="text-xs text-accent-green font-medium">
                                    3 watching
                                </span>
                            </div>
                        </div>
                    </div>
                    {/* Glow beneath mockup */}
                    <div
                        className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-16 bg-accent-blue/6 blur-[50px] rounded-full pointer-events-none"
                        aria-hidden="true"
                    />
                </div>
            </section>

            {/* ─── How It Works ──────────────────────────────────── */}
            <section className="px-6 py-24 relative z-10">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-blue mb-4 animate-fade-in">
                            How it works
                        </p>
                        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                            Three steps. That&apos;s it.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {STEPS.map(({ num, title, desc, color }, i) => {
                            const c = ACCENT_MAP[color];
                            return (
                                <div
                                    key={num}
                                    className="group relative p-8 rounded-2xl bg-surface-2 border border-white/6 hover:border-white/12 transition-all duration-300 animate-slide-up"
                                    style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                                >
                                    <span
                                        className={`text-5xl font-black ${c.text} opacity-20 absolute top-4 right-6`}
                                    >
                                        {num}
                                    </span>
                                    <div
                                        className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-5`}
                                    >
                                        {i === 0 && (
                                            <Chrome
                                                className={`w-5 h-5 ${c.text}`}
                                                aria-hidden="true"
                                            />
                                        )}
                                        {i === 1 && (
                                            <MousePointerClick
                                                className={`w-5 h-5 ${c.text}`}
                                                aria-hidden="true"
                                            />
                                        )}
                                        {i === 2 && (
                                            <Send
                                                className={`w-5 h-5 ${c.text}`}
                                                aria-hidden="true"
                                            />
                                        )}
                                    </div>
                                    <h3 className="text-base font-semibold text-white mb-2">
                                        {title}
                                    </h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ─── Features (Typographic/Editorial) ──────────────────────── */}
            <section className="py-32 relative z-10 border-y border-white/4 bg-surface-0 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 mb-20 md:mb-32">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-px bg-accent-violet/50" aria-hidden="true" />
                        <p className="text-xs font-black uppercase tracking-[0.4em] text-accent-violet">
                            Why Oculus
                        </p>
                    </div>
                    <h2 className="text-5xl md:text-8xl lg:text-[8rem] font-bold text-white tracking-tighter leading-[0.9] max-w-4xl">
                        Built for <br />
                        <span className="italic font-light text-zinc-500">simplicity.</span>
                    </h2>
                </div>

                <div className="flex flex-col w-full border-t border-white/4">
                    {FEATURES.map(({ icon: Icon, title, desc, color }, i) => {
                        const c = ACCENT_MAP[color];
                        return (
                            <div
                                key={title}
                                className="group relative w-full border-b border-white/4 overflow-hidden bg-surface-0 transition-colors duration-700 hover:bg-surface-1"
                            >
                                {/* Moving abstract background on hover */}
                                <div
                                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 ${c.bg} mix-blend-screen pointer-events-none`}
                                />

                                <div className="max-w-7xl mx-auto px-6 py-12 md:py-24 flex flex-col xl:flex-row xl:items-center justify-between gap-8 xl:gap-20 relative z-10">
                                    <div className="flex items-start xl:items-center gap-6 xl:gap-16 w-full xl:w-auto">
                                        <span
                                            className={`text-2xl xl:text-4xl font-mono opacity-20 transition-all duration-500 group-hover:opacity-100 group-hover:-translate-y-2 ${c.text}`}
                                        >
                                            {(i + 1).toString().padStart(2, "0")}
                                        </span>
                                        <h3 className="text-4xl md:text-6xl xl:text-[5.5rem] font-bold tracking-tighter text-white/30 transition-all duration-500 group-hover:text-white transform origin-left xl:group-hover:scale-[1.03] leading-none py-2">
                                            {title}
                                        </h3>
                                    </div>

                                    <div className="flex flex-row items-center gap-8 xl:gap-12 w-full xl:w-auto xl:max-w-xl justify-between xl:justify-end ml-12 xl:ml-0">
                                        <p className="text-base md:text-xl text-zinc-500 font-light leading-relaxed transition-all duration-500 group-hover:text-zinc-300 xl:opacity-0 xl:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0">
                                            {desc}
                                        </p>
                                        <div
                                            className={`shrink-0 w-16 h-16 xl:w-24 xl:h-24 rounded-full border border-white/5 flex items-center justify-center transition-all duration-700 xl:group-hover:scale-125 group-hover:-rotate-12 ${c.border} group-hover:bg-white/2 ${c.glow}`}
                                        >
                                            <Icon
                                                className={`w-8 h-8 xl:w-10 xl:h-10 text-zinc-600 transition-colors duration-500 group-hover:${c.text}`}
                                                strokeWidth={1}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Persistent left accent bar using currentColor trick */}
                                <div
                                    className={`absolute left-0 top-0 bottom-0 w-2 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-full group-hover:translate-x-0 ${c.text} bg-current`}
                                    aria-hidden="true"
                                />
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ─── Trust Bar ─────────────────────────────────────── */}
            <section className="px-6 py-16 border-t border-white/4 relative z-10">
                <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-8">
                    {TRUST_ITEMS.map(({ icon: Icon, label, color }) => {
                        const c = ACCENT_MAP[color];
                        return (
                            <div key={label} className="flex items-center gap-2.5">
                                <Icon className={`w-4 h-4 ${c.text}`} aria-hidden="true" />
                                <span className="text-sm text-zinc-400 font-medium">{label}</span>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ─── Bottom CTA ────────────────────────────────────── */}
            <section className="px-6 py-24 relative z-10">
                <div className="max-w-3xl mx-auto text-center space-y-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                        Ready to share your screen?
                    </h2>
                    <p className="text-lg text-zinc-400 max-w-xl mx-auto">
                        Join thousands who&apos;ve ditched clunky screen sharing tools. Oculus is
                        free, fast, and lives right in your browser.
                    </p>
                    <a
                        href="https://chromewebstore.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white text-black font-bold text-base transition-all shadow-[0_0_40px_rgba(59,130,246,0.12)] hover:shadow-[0_0_60px_rgba(59,130,246,0.2)] hover:scale-[1.03] active:scale-[0.98] cursor-pointer focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    >
                        <Chrome className="w-5 h-5" aria-hidden="true" />
                        Install Oculus - It&apos;s Free
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </a>
                </div>
            </section>

            {/* ─── Footer ────────────────────────────────────────── */}
            <footer className="border-t border-white/4 px-8 py-8 relative z-10">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/icon500.png"
                            alt="Oculus Logo"
                            width={28}
                            height={28}
                            className="w-7 h-7 object-contain"
                        />
                        <span className="text-sm font-semibold text-zinc-400">Oculus</span>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-zinc-600">
                        <span>P2P Screen Sharing</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-800" aria-hidden="true" />
                        <span>Built with PeerJS & WebRTC</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-800" aria-hidden="true" />
                        <span>© 2026</span>
                    </div>
                </div>
            </footer>
        </main>
    );
}
