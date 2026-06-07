import { NextRequest, NextResponse } from "next/server";

const ANISKIP_BASE = "https://api.aniskip.com/v2";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const malId = searchParams.get("malId");
  const episode = searchParams.get("episode");
  const episodeLength = searchParams.get("episodeLength");

  if (!malId || !episode) {
    return NextResponse.json({ error: "Missing malId or episode" }, { status: 400 });
  }

  try {
    const types = ["op", "mixed-op", "ed", "mixed-ed", "recap"].join("&types[]=");
    const lengthParam = episodeLength ? `&episodeLength=${episodeLength}` : "";
    const url = `${ANISKIP_BASE}/skip-times/${malId}/${episode}?types[]=${types}${lengthParam}`;

    const res = await fetch(url);

    if (res.status === 404) {
      return NextResponse.json({ found: false, results: {}, statusCode: 404 }, {
        headers: { "Cache-Control": "public, s-maxage=86400" },
      });
    }

    if (!res.ok) {
      return NextResponse.json({ error: "AniSkip error" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
    });
  } catch {
    return NextResponse.json({ found: false, results: {}, statusCode: 500 });
  }
}
