import WatchClient from "@/components/WatchClient";

interface PageProps {
    params: Promise<{ sessionId: string }>;
}

export default async function WatchPage({ params }: PageProps) {
    const { sessionId } = await params;
    return <WatchClient sessionId={sessionId} />;
}
