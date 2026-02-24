import type { Metadata } from "next";
import WatchClient from "@/components/WatchClient";

export const metadata: Metadata = {
    title: "Watching Session",
    robots: {
        index: false,
        follow: false,
    },
};
interface PageProps {
    params: Promise<{ sessionId: string }>;
}

export default async function WatchPage({ params }: PageProps) {
    const { sessionId } = await params;
    return <WatchClient sessionId={sessionId} />;
}
