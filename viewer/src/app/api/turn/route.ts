import { NextResponse } from "next/server";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
    try {
        const turnTokenId = process.env.TURN_TOKEN_ID;
        const apiToken = process.env.API_TOKEN;
        const HOURS = 5;

        const response = await fetch(
            `https://rtc.live.cloudflare.com/v1/turn/keys/${turnTokenId}/credentials/generate-ice-servers`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiToken}`,
                },
                body: JSON.stringify({ ttl: HOURS * 60 * 60 }),
                cache: "no-store",
            },
        );

        if (!response.ok) {
            throw new Error(`Cloudflare API error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data, { headers: corsHeaders });
    } catch (error) {
        console.error("Failed to fetch TURN credentials:", error);
        return NextResponse.json(
            { error: "Failed to fetch TURN credentials" },
            { status: 500, headers: corsHeaders },
        );
    }
}
