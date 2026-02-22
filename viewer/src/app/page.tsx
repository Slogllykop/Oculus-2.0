import Link from "next/link";
import { Monitor, Zap, Globe, Shield } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-900/40">
            <Monitor className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">Oculus</span>
        </div>
        <a
          href="https://chromewebstore.google.com"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors"
        >
          Install Extension
        </a>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        {/* Glow orb */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-brand-600/10 blur-3xl pointer-events-none" />

        <div className="relative space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-4">
            <Zap className="w-3.5 h-3.5" />
            Peer-to-peer · Zero latency · No accounts
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight">
            Share your screen
            <span className="block bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              with anyone
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
            Instant, peer-to-peer screen broadcasting. Install the Chrome extension,
            click <strong className="text-gray-200">Start Sharing</strong>, and send the
            link — no accounts, no servers, no friction.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-semibold transition-all shadow-lg shadow-brand-900/40 hover:shadow-brand-900/60 hover:scale-[1.02]"
            >
              <Monitor className="w-4 h-4" />
              Get Chrome Extension
            </a>
            <p className="text-sm text-gray-500">
              Have a link?{" "}
              <span className="text-brand-400">
                It will open automatically
              </span>
            </p>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20 max-w-4xl w-full relative">
          {[
            {
              icon: Zap,
              title: "Instant Sharing",
              desc: "One click to start. Get a shareable URL immediately — no sign-up required.",
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
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/8 hover:bg-white/[0.05] transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-brand-400" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-8 py-6 flex items-center justify-between text-xs text-gray-600">
        <span>© 2026 Oculus · P2P Screen Sharing</span>
        <span>Built with PeerJS</span>
      </footer>
    </main>
  );
}
