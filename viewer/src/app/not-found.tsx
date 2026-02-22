import Link from "next/link";
import { Monitor, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-6">
      <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-6">
        <Monitor className="w-10 h-10 text-zinc-700" />
      </div>
      <h1 className="text-4xl font-extrabold text-white mb-3">404</h1>
      <p className="text-zinc-500 mb-8 max-w-sm">
        This stream doesn&apos;t exist or has already ended.
      </p>
      <Link
        href="/"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors"
      >
        <Home className="w-4 h-4" />
        Back to Home
      </Link>
    </div>
  );
}
