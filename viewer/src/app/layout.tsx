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
    metadataBase: new URL("https://oculus.isdevs.cv"),
    title: {
        default: "Oculus | Free Peer-to-Peer Screen Sharing",
        template: "%s | Oculus Screen Share",
    },
    description:
        "Lightning-fast, secure, and free peer-to-peer screen sharing from your browser. No downloads or sign-ups required. Share instantly with WebRTC.",
    keywords: [
        "screen sharing",
        "peer-to-peer",
        "P2P",
        "WebRTC",
        "browser screen share",
        "free screen sharing",
        "no download screen share",
        "secure screen sharing",
        "instant screen share",
        "online presentation",
        "remote collaboration",
    ],
    authors: [{ name: "Slogllykop" }, { name: "Oculus Community" }],
    creator: "Slogllykop",
    publisher: "Oculus",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        title: "Oculus | Free Peer-to-Peer Screen Sharing",
        description:
            "Share your screen instantly with zero friction. Oculus is a secure, P2P screen sharing tool that works entirely in your browser without downloads or sign-ups.",
        siteName: "Oculus Screen Share",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Oculus | Free Peer-to-Peer Screen Sharing",
        description:
            "Share your screen instantly with zero friction. Oculus is a secure, P2P screen sharing tool that works entirely in your browser.",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    alternates: {
        canonical: "/",
    },
    category: "technology",
    icons: {
        icon: "/icon500.png",
        shortcut: "/icon500.png",
        apple: "/icon500.png",
        other: {
            rel: "apple-touch-icon-precomposed",
            url: "/icon500.png",
        },
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={`${instrumentSans.variable} ${jetbrainsMono.variable}`}>
            <body className="bg-surface-0 text-white antialiased">{children}</body>
        </html>
    );
}
