import { Home, Monitor } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-surface-0 flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center mb-6">
                <Monitor className="w-10 h-10 text-zinc-700" />
            </div>
            <h1 className="text-5xl font-black text-white mb-3 tracking-tight">404</h1>
            <p className="text-zinc-500 mb-8 max-w-sm">
                This stream doesn&apos;t exist or has already ended.
            </p>
            <Link
                href="/"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-sm font-semibold transition-all hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
                <Home className="w-4 h-4" />
                Back to Home
            </Link>
        </div>
    );
}
