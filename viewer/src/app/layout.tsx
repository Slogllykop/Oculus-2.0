import type { Metadata } from "next";
import "./globals.css";

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
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" />
            </head>
            <body className="bg-black text-gray-100 antialiased">{children}</body>
        </html>
    );
}
