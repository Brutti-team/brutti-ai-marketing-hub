import { NextResponse } from "next/server";
import { env } from "cloudflare:workers";
import { BRUTTI_SOUL_MASTER, formatGeneratedContent, type GeneratedBruttiContent } from "../../../lib/brutti-soul-master";
import { createContent } from "../../../lib/brutti-store";
import { getLiveMetaInsights, performanceContext } from "../../../lib/meta-performance";

export const dynamic = "force-dynamic";
type RuntimeEnv = { META_INSIGHTS_API_URL?: string; META_INSIGHTS_API_KEY?: string; OPENAI_API_KEY?: string };
const fields = ["topic", "objective", "platform", "event", "people", "facts", "cta", "performancePlan"] as const;
const requiredFields = ["topic", "objective", "platform", "event", "facts"] as const;
type Brief = Record<(typeof fields)[number], string>;
const clean = (value: unknown) => typeof value === "string" ? value.trim() : "";

function parseOutput(value: unknown): GeneratedBruttiContent | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>; const string = (key: string) => clean(data[key]);
  const hooks = Array.isArray(data.hooks) ? data.hooks.map(clean).filter(Boolean).slice(0, 3) : [];
  const clarificationQuestions = Array.isArray(data.clarificationQuestions) ? data.clarificationQuestions.map(clean).filter(Boolean).slice(0, 3) : [];
  if (!string("contentAngle") || !string("caption") || hooks.length !== 3 || !string("visualSuggestion") || !string("styleCheck")) return null;
  return { contentAngle: string("contentAngle"), caption: string("caption"), hooks: [hooks[0], hooks[1], hooks[2]], visualSuggestion: string("visualSuggestion"), cta: string("cta"), styleCheck: string("styleCheck"), clarificationQuestions };
}

async function generateWithOpenAI(apiKey: string, brief: Brief, context: string) {
  const schema = { type: "object", additionalProperties: false, required: ["contentAngle", "caption", "hooks", "visualSuggestion", "cta", "styleCheck", "clarificationQuestions"], properties: { contentAngle: { type: "string" }, caption: { type: "string" }, hooks: { type: "array", minItems: 3, maxItems: 3, items: { type: "string" } }, visualSuggestion: { type: "string" }, cta: { type: "string" }, styleCheck: { type: "string" }, clarificationQuestions: { type: "array", maxItems: 3, items: { type: "string" } } } };
  const userInput = `Maklumat post hari ini:\nTopik / produk: ${brief.topic}\nTujuan post: ${brief.objective}\nPlatform: ${brief.platform}\nApa kejadian sebenar hari ini: ${brief.event}\nSiapa terlibat: ${brief.people || "Tidak diberi"}\nFakta wajib: ${brief.facts}\nCTA jika perlu: ${brief.cta || "Tidak diberi"}\nData performance/rencana yang mahu dirujuk: ${brief.performancePlan || "Tidak diberi"}\n\nContext performance semasa/historical daripada Google Sheets / Meta (untuk panduan dalaman sahaja):\n${context}\n\nJika context kurang lengkap, jangan buat dakwaan performance. Cadangkan format berdasarkan data hanya jika jelas. Hasilkan JSON ikut schema.`;
  const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: "gpt-5-mini", instructions: BRUTTI_SOUL_MASTER, input: userInput, text: { format: { type: "json_schema", name: "brutti_content", strict: true, schema } } }) });
  if (!response.ok) throw new Error("Content generator could not be reached.");
  const payload = await response.json() as { output_text?: string };
  if (!payload.output_text) throw new Error("Content generator returned an empty response.");
  try { return parseOutput(JSON.parse(payload.output_text)); } catch { return null; }
}

export async function POST(request: Request) {
  let body: Partial<Brief>; try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid content brief." }, { status: 400 }); }
  const brief = Object.fromEntries(fields.map((field) => [field, clean(body[field])])) as Brief;
  const missing = requiredFields.filter((field) => !brief[field]);
  if (missing.length) return NextResponse.json({ error: "Please add the topic, goal, platform, real event and required facts." }, { status: 400 });
  const runtime = env as unknown as RuntimeEnv;
  if (!runtime.OPENAI_API_KEY?.trim()) return NextResponse.json({ error: "Content generation is waiting for its private AI key configuration." }, { status: 503 });
  let insights = null; let performanceStatus = "Live Google Sheets / Meta context was unavailable, so no performance claim was used.";
  try { insights = await getLiveMetaInsights({ endpoint: runtime.META_INSIGHTS_API_URL, apiKey: runtime.META_INSIGHTS_API_KEY }); performanceStatus = insights.sourceUpdatedAt ? `Live context used (sheet updated ${insights.sourceUpdatedAt}).` : "Live context used; source update time was not provided."; } catch { /* keep generation useful without metrics */ }
  try {
    const output = await generateWithOpenAI(runtime.OPENAI_API_KEY, brief, performanceContext(insights));
    if (!output) return NextResponse.json({ error: "Content generator returned an invalid draft. Please try again." }, { status: 502 });
    const saved = await createContent({ title: `${brief.topic} — ${output.contentAngle}`.slice(0, 160), platform: brief.platform, contentType: "Brutti AI content brief", productName: brief.topic, content: formatGeneratedContent(output) });
    return NextResponse.json({ ok: true, output, saved, performanceStatus });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Content could not be generated." }, { status: 502 }); }
}
