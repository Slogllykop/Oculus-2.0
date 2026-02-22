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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-gray-100 antialiased">{children}</body>
    </html>
  );
}
