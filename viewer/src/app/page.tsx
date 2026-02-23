import { Globe, Monitor, Shield, Zap } from "lucide-react";

const FEATURES = [
    {
        icon: Zap,
        title: "Instant Sharing",
        desc: "One click to start. Get a shareable URL immediately - no sign-up required.",
    },
    {
        icon: Globe,
        title: "Watch Anywhere",
        desc: "Viewers can join from any device, any browser, anywhere in the world.",
    },
    {
        icon: Shield,
        title: "Private by Default",
        desc: "Streams are peer-to-peer. Only people with your link can watch.",
    },
] as const;

export default function Home() {
    return (
        <main className="min-h-screen bg-black flex flex-col">
            {/* Nav */}
            <nav className="flex items-center justify-between px-8 py-5 border-b border-white/[0.07] animate-fade-in">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-900/40">
                        <Monitor className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                    <span className="text-lg font-bold text-white tracking-wide">Oculus</span>
                </div>
                <a
                    href="https://chromewebstore.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                    Install Extension
                </a>
            </nav>

            {/* Hero */}
            <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center relative overflow-hidden">
                {/* Gradient orbs */}
                <div
                    className="absolute top-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-brand-600/6 blur-[120px] pointer-events-none animate-float"
                    aria-hidden="true"
                />
                <div
                    className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] rounded-full bg-brand-400/4 blur-[100px] pointer-events-none animate-float"
                    style={{ animationDelay: "3s" }}
                    aria-hidden="true"
                />
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full bg-brand-500/5 blur-[150px] pointer-events-none"
                    aria-hidden="true"
                />

                <div className="relative space-y-6 max-w-3xl">
                    {/* Badge */}
                    <div
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-4 animate-fade-in"
                        style={{ animationDelay: "0.1s" }}
                    >
                        <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                        Peer-to-peer · Zero latency · No accounts
                    </div>

                    {/* Heading */}
                    <h1
                        className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight animate-slide-up"
                        style={{ animationDelay: "0.2s", textWrap: "balance" }}
                    >
                        Share your screen
                        <span className="block bg-linear-to-r from-brand-400 to-brand-300 bg-clip-text text-transparent mt-1">
                            with anyone
                        </span>
                    </h1>

                    {/* Subheading */}
                    <p
                        className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed animate-slide-up"
                        style={{ animationDelay: "0.35s" }}
                    >
                        Instant, peer-to-peer screen broadcasting. Install the Chrome extension,
                        click <strong className="text-white">Start Sharing</strong>, and send the
                        link - no accounts, no servers, no friction.
                    </p>

                    {/* CTA */}
                    <div
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-slide-up"
                        style={{ animationDelay: "0.5s" }}
                    >
                        <a
                            href="https://chromewebstore.google.com"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-all shadow-lg shadow-brand-900/30 hover:scale-[1.03] active:scale-[0.98] animate-glow-pulse cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        >
                            <Monitor className="w-4 h-4" aria-hidden="true" />
                            Get Chrome Extension
                        </a>
                        <p className="text-sm text-zinc-500">
                            Have a link?{" "}
                            <span className="text-brand-400">It will open automatically</span>
                        </p>
                    </div>
                </div>

                {/* Feature cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20 max-w-4xl w-full relative">
                    {FEATURES.map(({ icon: Icon, title, desc }, i) => (
                        <div
                            key={title}
                            className="p-6 rounded-2xl bg-white/2 border border-white/[0.07] hover:border-brand-500/30 hover:bg-white/4 transition-all duration-300 text-left group hover:scale-[1.02] hover:shadow-lg hover:shadow-brand-900/10 animate-slide-up"
                            style={{ animationDelay: `${0.6 + i * 0.1}s` }}
                        >
                            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4 group-hover:bg-brand-500/20 group-hover:border-brand-500/30 transition-all duration-300">
                                <Icon
                                    className="w-5 h-5 text-brand-400 group-hover:text-brand-300 transition-colors duration-300"
                                    aria-hidden="true"
                                />
                            </div>
                            <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
                            <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/6 px-8 py-6 flex items-center justify-between text-xs text-zinc-700">
                <span>© 2026 Oculus · P2P Screen Sharing</span>
                <span>Built with PeerJS</span>
            </footer>
        </main>
    );
}
