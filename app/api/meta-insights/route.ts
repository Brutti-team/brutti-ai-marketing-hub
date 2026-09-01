import { NextResponse } from "next/server";
import { env } from "cloudflare:workers";
import { getLiveMetaInsights } from "../../lib/meta-performance";

export const dynamic = "force-dynamic";

type RuntimeEnv = {
  META_INSIGHTS_API_URL?: string;
  META_INSIGHTS_API_KEY?: string;
};

export async function GET() {
  const runtime = env as unknown as RuntimeEnv;
  try {
    const normalized = await getLiveMetaInsights({ endpoint: runtime.META_INSIGHTS_API_URL, apiKey: runtime.META_INSIGHTS_API_KEY });

    return NextResponse.json(normalized, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Meta insights source could not be reached." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
