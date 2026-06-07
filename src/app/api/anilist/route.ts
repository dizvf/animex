import { NextRequest, NextResponse } from "next/server";

const ANILIST_API = "https://graphql.anilist.co";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(ANILIST_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (err) {
    return NextResponse.json({ error: "AniList request failed" }, { status: 500 });
  }
}
