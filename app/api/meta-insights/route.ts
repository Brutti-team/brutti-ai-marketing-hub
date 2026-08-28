import { NextResponse } from "next/server";
import { env } from "cloudflare:workers";

export const dynamic = "force-dynamic";

type TrendPoint = { date: string; value: number };
type TopPost = { sourceId: string; views: number; measuredAt: string | null };

type MetaInsightsResponse = {
  sourceUpdatedAt: string | null;
  instagram: { latestReach: number | null; trend: TrendPoint[] };
  facebook: { topPosts: TopPost[] };
};

type RuntimeEnv = {
  META_INSIGHTS_API_URL?: string;
  META_INSIGHTS_API_KEY?: string;
};

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function finiteNumber(value: unknown): number | null {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function normalizePayload(payload: unknown): MetaInsightsResponse | null {
  const root = record(payload);
  const instagram = record(root?.instagram);
  const facebook = record(root?.facebook);
  if (!root || !instagram || !facebook) return null;

  const trend = Array.isArray(instagram.trend)
    ? instagram.trend.flatMap((point) => {
        const row = record(point);
        const date = text(row?.date);
        const value = finiteNumber(row?.value);
        return date !== null && value !== null ? [{ date, value }] : [];
      })
    : [];

  const topPosts = Array.isArray(facebook.topPosts)
    ? facebook.topPosts.flatMap((post) => {
        const row = record(post);
        const sourceId = text(row?.sourceId);
        const views = finiteNumber(row?.views);
        return sourceId !== null && views !== null
          ? [{ sourceId, views, measuredAt: text(row?.measuredAt) }]
          : [];
      })
    : [];

  return {
    sourceUpdatedAt: text(root.sourceUpdatedAt),
    instagram: {
      latestReach: finiteNumber(instagram.latestReach),
      trend: trend.slice(-14),
    },
    facebook: {
      topPosts: topPosts.slice(0, 5),
    },
  };
}

export async function GET() {
  const runtime = env as unknown as RuntimeEnv;
  const endpoint = runtime.META_INSIGHTS_API_URL?.trim();
  const apiKey = runtime.META_INSIGHTS_API_KEY?.trim();

  if (!endpoint || !apiKey) {
    return NextResponse.json(
      { error: "Meta insights connection is not configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const url = new URL(endpoint);
    url.searchParams.set("key", apiKey);
    const response = await fetch(url.toString(), {
      headers: { accept: "application/json" },
      cf: { cacheTtl: 0, cacheEverything: false },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Meta insights source could not be reached." },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    const normalized = normalizePayload(await response.json());
    if (!normalized) {
      return NextResponse.json(
        { error: "Meta insights source returned an invalid response." },
        { status: 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(normalized, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch {
    return NextResponse.json(
      { error: "Meta insights source could not be reached." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
