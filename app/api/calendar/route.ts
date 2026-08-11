import { NextResponse } from "next/server";
import { database, ensureStore, listCalendar } from "../../lib/brutti-store";

const statuses = new Set(["Draft", "Scheduled", "Published"]);
const clean = (value: unknown) => typeof value === "string" ? value.trim() : "";

export async function GET() {
  try {
    return NextResponse.json({ items: await listCalendar(), syncedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ error: "Calendar could not be loaded." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await ensureStore();
  const body = await request.json() as Record<string, unknown>;
  const title = clean(body.title);
  const date = clean(body.date);
  if (!title || !date) return NextResponse.json({ error: "Title and date are required." }, { status: 400 });
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const status = statuses.has(clean(body.status)) ? clean(body.status) : "Draft";
  await (await database()).prepare(`INSERT INTO content_calendar
    (id, title, date, time, platform, content_type, product_name, notes, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'Facebook', ?, ?, ?, ?, ?, ?)`)
    .bind(id, title, date, clean(body.time), clean(body.contentType) || "Facebook Post", clean(body.productName), clean(body.notes), status, now, now).run();
  return NextResponse.json({ ok: true, id });
}

export async function PATCH(request: Request) {
  await ensureStore();
  const body = await request.json() as Record<string, unknown>;
  const id = clean(body.id);
  const title = clean(body.title);
  const date = clean(body.date);
  const status = clean(body.status);
  if (!id || !title || !date || !statuses.has(status)) return NextResponse.json({ error: "Invalid calendar update." }, { status: 400 });
  await (await database()).prepare(`UPDATE content_calendar SET title = ?, date = ?, time = ?, content_type = ?,
    product_name = ?, notes = ?, status = ?, updated_at = ? WHERE id = ?`)
    .bind(title, date, clean(body.time), clean(body.contentType) || "Facebook Post", clean(body.productName), clean(body.notes), status, new Date().toISOString(), id).run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  await ensureStore();
  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) return NextResponse.json({ error: "Calendar ID is required." }, { status: 400 });
  await (await database()).prepare("DELETE FROM content_calendar WHERE id = ?").bind(id).run();
  return NextResponse.json({ ok: true });
}
