import type { Metadata } from "next";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    display: "swap",
    variable: "--font-instrument",
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    display: "swap",
    variable: "--font-jetbrains",
});

export const metadata: Metadata = {
    title: "Oculus – Screen Sharing, Right in Your Browser",
    description:
        "Instant, peer-to-peer screen sharing that lives in your browser. No downloads, no accounts, no servers — just share and watch.",
    openGraph: {
        title: "Oculus – Screen Sharing, Right in Your Browser",
        description:
            "Instant, peer-to-peer screen sharing that lives in your browser. No downloads, no accounts, no servers.",
        type: "website",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${instrumentSans.variable} ${jetbrainsMono.variable}`}>
            <body className="bg-surface-0 text-white antialiased">{children}</body>
        </html>
    );
}
