import { NextRequest, NextResponse } from "next/server";

const ANIFY_BASE = process.env.ANIFY_API_URL || "https://api.anify.tv";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");
  const episode = searchParams.get("episode");
  const providerId = searchParams.get("providerId") ?? "gogoanime";
  const subType = searchParams.get("subType") ?? "sub";

  if (!id || !episode) {
    return NextResponse.json({ error: "Missing id or episode" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${ANIFY_BASE}/sources?id=${id}&providerId=${providerId}&watchId=${id}-episode-${episode}&episode=${episode}&subType=${subType}&server=default`,
      {
        headers: process.env.ANIFY_API_KEY
          ? { Authorization: `Bearer ${process.env.ANIFY_API_KEY}` }
          : {},
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Anify error", status: res.status }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch sources" }, { status: 500 });
  }
}
