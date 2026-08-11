import { NextResponse } from "next/server";
import { database, ensureStore, listContent } from "../../lib/brutti-store";

const statuses = new Set(["Review", "Approved", "Rejected", "Published"]);
const clean = (value: unknown) => typeof value === "string" ? value.trim() : "";

export async function GET() {
  try {
    return NextResponse.json({ items: await listContent(), syncedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: "Content could not be loaded." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await ensureStore();
  const body = await request.json() as Record<string, unknown>;
  const title = clean(body.title);
  const content = clean(body.content);
  if (!title || !content) return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await (await database()).prepare(`INSERT INTO marketing_content
    (id, title, platform, content_type, product_name, content, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'Review', ?, ?)`)
    .bind(id, title, clean(body.platform) || "Facebook", clean(body.contentType) || "Facebook Post", clean(body.productName), content, now, now).run();
  return NextResponse.json({ ok: true, id });
}

export async function PATCH(request: Request) {
  await ensureStore();
  const body = await request.json() as Record<string, unknown>;
  const id = clean(body.id);
  const title = clean(body.title);
  const content = clean(body.content);
  const status = clean(body.status);
  if (!id || !title || !content || !statuses.has(status)) return NextResponse.json({ error: "Invalid content update." }, { status: 400 });
  const now = new Date().toISOString();
  const publishedAt = status === "Published" ? now : null;
  await (await database()).prepare(`UPDATE marketing_content SET title = ?, content = ?, status = ?,
    product_name = ?, content_type = ?, updated_at = ?, published_at = ? WHERE id = ?`)
    .bind(title, content, status, clean(body.productName), clean(body.contentType) || "Facebook Post", now, publishedAt, id).run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  await ensureStore();
  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) return NextResponse.json({ error: "Content ID is required." }, { status: 400 });
  await (await database()).prepare("DELETE FROM marketing_content WHERE id = ?").bind(id).run();
  return NextResponse.json({ ok: true });
}
