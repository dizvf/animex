import { NextRequest, NextResponse } from "next/server";

const JIKAN_BASE = "https://api.jikan.moe/v4";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const malId = searchParams.get("malId");
  const page = searchParams.get("page") ?? "1";

  if (!malId) {
    return NextResponse.json({ error: "Missing malId" }, { status: 400 });
  }

  try {
    const res = await fetch(`${JIKAN_BASE}/anime/${malId}/episodes?page=${page}`);

    if (!res.ok) {
      return NextResponse.json({ error: "Jikan error" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch episodes" }, { status: 500 });
  }
}
