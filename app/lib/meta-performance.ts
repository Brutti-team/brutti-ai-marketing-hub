export type TrendPoint = { date: string; value: number };
export type TopPost = {
  sourceId: string;
  views: number | null;
  reach: number | null;
  reactions: number | null;
  comments: number | null;
  shares: number | null;
  engagementRate: number | null;
  measuredAt: string | null;
};

export type MetaInsightsResponse = {
  sourceUpdatedAt: string | null;
  instagram: { latestReach: number | null; followers: number | null; trend: TrendPoint[] };
  facebook: { followers: number | null; topPosts: TopPost[] };
};

type RuntimeConfig = { endpoint?: string; apiKey?: string };

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}
function finiteNumber(value: unknown): number | null {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}
function text(value: unknown): string | null { return typeof value === "string" && value.trim() ? value.trim() : null; }
function metric(row: Record<string, unknown> | null, ...keys: string[]) {
  for (const key of keys) {
    const value = finiteNumber(row?.[key]);
    if (value !== null) return value;
  }
  return null;
}

export function normalizeMetaInsights(payload: unknown): MetaInsightsResponse | null {
  const outer = record(payload);
  const root = record(outer?.data) || outer;
  const instagram = record(root?.instagram);
  const facebook = record(root?.facebook);
  if (!root || !instagram || !facebook) return null;

  const trend = Array.isArray(instagram.trend) ? instagram.trend.flatMap((point) => {
    const row = record(point); const date = text(row?.date); const value = metric(row, "value", "reach");
    return date !== null && value !== null ? [{ date, value }] : [];
  }) : [];
  const topPosts = Array.isArray(facebook.topPosts) ? facebook.topPosts.flatMap((post) => {
    const row = record(post); const sourceId = text(row?.sourceId) || text(row?.postId) || text(row?.id);
    if (!sourceId) return [];
    return [{ sourceId, views: metric(row, "views", "mediaViews", "videoViews"), reach: metric(row, "reach"), reactions: metric(row, "reactions", "likes"), comments: metric(row, "comments"), shares: metric(row, "shares"), engagementRate: metric(row, "engagementRate", "engagement_rate"), measuredAt: text(row?.measuredAt) || text(row?.date) }];
  }) : [];
  return {
    sourceUpdatedAt: text(root.sourceUpdatedAt) || text(root.updatedAt) || text(root.lastUpdated),
    instagram: { latestReach: metric(instagram, "latestReach", "reach"), followers: metric(instagram, "followers", "followerCount"), trend: trend.slice(-14) },
    facebook: { followers: metric(facebook, "followers", "followerCount"), topPosts: topPosts.slice(0, 5) },
  };
}

export async function getLiveMetaInsights(config: RuntimeConfig): Promise<MetaInsightsResponse> {
  const endpoint = config.endpoint?.trim(); const apiKey = config.apiKey?.trim();
  if (!endpoint || !apiKey) throw new Error("Meta insights connection is not configured.");
  const url = new URL(endpoint); url.searchParams.set("key", apiKey);
  const response = await fetch(url.toString(), { headers: { accept: "application/json", "Cache-Control": "no-cache" } });
  if (!response.ok) throw new Error("Meta insights source could not be reached.");
  const normalized = normalizeMetaInsights(await response.json());
  if (!normalized) throw new Error("Meta insights source returned an invalid response.");
  return normalized;
}

export function performanceContext(insights: MetaInsightsResponse | null) {
  if (!insights) return "No live performance context was available. Do not make performance claims.";
  const lines = [
    insights.sourceUpdatedAt ? `Data source last updated: ${insights.sourceUpdatedAt}` : "Data source update time unavailable.",
    insights.facebook.followers !== null ? `Facebook followers: ${insights.facebook.followers}` : "Facebook follower count unavailable.",
    insights.instagram.followers !== null ? `Instagram followers: ${insights.instagram.followers}` : "Instagram follower count unavailable.",
    insights.instagram.latestReach !== null ? `Latest Instagram recorded daily reach: ${insights.instagram.latestReach}` : "Latest Instagram reach unavailable.",
  ];
  for (const post of insights.facebook.topPosts) {
    lines.push(`Facebook post ${post.sourceId}: ${[["views", post.views], ["reach", post.reach], ["reactions", post.reactions], ["comments", post.comments], ["shares", post.shares], ["engagement rate", post.engagementRate]].filter(([, value]) => value !== null).map(([name, value]) => `${name} ${value}`).join(", ") || "no usable metrics"}.`);
  }
  return lines.join("\n");
}
