import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800"],
    display: "swap",
    variable: "--font-sans",
});

export const metadata: Metadata = {
    title: "Oculus – Live Screen Share",
    description: "Watch live screen sharing streams in real-time, anywhere in the world.",
    openGraph: {
        title: "Oculus – Live Screen Share",
        description: "Watch live screen sharing streams in real-time, anywhere in the world.",
        type: "website",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="bg-black text-gray-100 antialiased">{children}</body>
        </html>
    );
}
