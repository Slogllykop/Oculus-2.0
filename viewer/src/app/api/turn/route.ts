import { NextResponse } from "next/server";

export async function GET() {
    try {
        const response = await fetch("https://speed.cloudflare.com/turn-creds", {
            cache: "no-store",
        });

        if (!response.ok) {
            throw new Error(`Cloudflare API error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Failed to fetch TURN credentials:", error);
        return NextResponse.json({ error: "Failed to fetch TURN credentials" }, { status: 500 });
    }
}
