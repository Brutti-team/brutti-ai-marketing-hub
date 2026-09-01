import { facebookCalendar, facebookGeneratedContent } from "../brutti-facebook-data";

type D1Result<T> = { results?: T[] };

export type ContentRecord = {
  id: string;
  title: string;
  platform: string;
  contentType: string;
  productName: string;
  content: string;
  status: "Review" | "Approved" | "Rejected" | "Published";
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type CalendarRecord = {
  id: string;
  title: string;
  date: string;
  time: string;
  platform: string;
  contentType: string;
  productName: string;
  notes: string;
  status: "Draft" | "Scheduled" | "Published";
  createdAt: string;
  updatedAt: string;
};

export type MarketingRequestRecord = {
  id: string;
  name: string;
  platform: string;
  contentType: string;
  productName: string;
  objective: string;
  keyMessage: string;
  promotion: string;
  language: string;
  status: "New";
  source: string;
  submittedAt: string;
};

export async function database() {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) throw new Error("Website database is unavailable.");
  return env.DB;
}

export async function ensureStore() {
  const db = await database();
  await db.prepare(`CREATE TABLE IF NOT EXISTS marketing_content (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'Facebook',
    content_type TEXT NOT NULL DEFAULT 'Facebook Post',
    product_name TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Review',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    published_at TEXT
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS content_calendar (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL DEFAULT '',
    platform TEXT NOT NULL DEFAULT 'Facebook',
    content_type TEXT NOT NULL DEFAULT 'Facebook Post',
    product_name TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Draft',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS marketing_requests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    platform TEXT NOT NULL DEFAULT 'Facebook',
    content_type TEXT NOT NULL DEFAULT 'Facebook Post',
    product_name TEXT NOT NULL DEFAULT '',
    objective TEXT NOT NULL,
    key_message TEXT NOT NULL DEFAULT '',
    promotion TEXT NOT NULL DEFAULT '',
    language TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'New',
    source TEXT NOT NULL,
    submitted_at TEXT NOT NULL
  )`).run();

  const contentCount = await db.prepare("SELECT COUNT(*) AS count FROM marketing_content").first<{ count: number }>();
  if (!contentCount?.count) {
    const now = new Date().toISOString();
    for (const [index, item] of facebookGeneratedContent.entries()) {
      await db.prepare(`INSERT OR IGNORE INTO marketing_content
        (id, title, platform, content_type, product_name, content, status, created_at, updated_at)
        VALUES (?, ?, 'Facebook', 'Facebook Post', ?, ?, 'Review', ?, ?)`)
        .bind(`fb-content-${index + 1}`, item.title, item.title, item.content, now, now).run();
    }
  }

  const calendarCount = await db.prepare("SELECT COUNT(*) AS count FROM content_calendar").first<{ count: number }>();
  if (!calendarCount?.count) {
    const now = new Date();
    const mondayOffset = (8 - now.getDay()) % 7;
    for (const [index, item] of facebookCalendar.entries()) {
      const date = new Date(now);
      date.setDate(now.getDate() + mondayOffset + index);
      await db.prepare(`INSERT OR IGNORE INTO content_calendar
        (id, title, date, time, platform, content_type, product_name, notes, status, created_at, updated_at)
        VALUES (?, ?, ?, '10:00', 'Facebook', ?, ?, ?, 'Draft', ?, ?)`)
        .bind(
          `fb-calendar-${index + 1}`,
          item.theme,
          date.toISOString().slice(0, 10),
          item.format,
          item.product,
          `${item.day} recommendation`,
          now.toISOString(),
          now.toISOString(),
        ).run();
    }
  }
}

export async function listContent(): Promise<ContentRecord[]> {
  await ensureStore();
  const data = await (await database()).prepare(`SELECT id, title, platform, content_type AS contentType,
    product_name AS productName, content, status, created_at AS createdAt,
    updated_at AS updatedAt, published_at AS publishedAt
    FROM marketing_content ORDER BY updated_at DESC`).all<ContentRecord>();
  return (data as D1Result<ContentRecord>).results || [];
}

export async function createContent(input: Pick<ContentRecord, "title" | "platform" | "contentType" | "productName" | "content">) {
  await ensureStore();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await (await database()).prepare(`INSERT INTO marketing_content
    (id, title, platform, content_type, product_name, content, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'Review', ?, ?)`)
    .bind(id, input.title, input.platform, input.contentType, input.productName, input.content, now, now).run();
  return { id, createdAt: now };
}

export async function listCalendar(): Promise<CalendarRecord[]> {
  await ensureStore();
  const data = await (await database()).prepare(`SELECT id, title, date, time, platform,
    content_type AS contentType, product_name AS productName, notes, status,
    created_at AS createdAt, updated_at AS updatedAt
    FROM content_calendar ORDER BY date, time`).all<CalendarRecord>();
  return (data as D1Result<CalendarRecord>).results || [];
}

export async function createMarketingRequest(input: Omit<MarketingRequestRecord, "id" | "status" | "source" | "submittedAt">) {
  await ensureStore();
  const item: MarketingRequestRecord = {
    ...input,
    id: crypto.randomUUID(),
    status: "New",
    source: "BRUTTI AI Marketing Hub",
    submittedAt: new Date().toISOString(),
  };
  await (await database()).prepare(`INSERT INTO marketing_requests
    (id, name, platform, content_type, product_name, objective, key_message, promotion, language, status, source, submitted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(item.id, item.name, item.platform, item.contentType, item.productName, item.objective, item.keyMessage, item.promotion, item.language, item.status, item.source, item.submittedAt)
    .run();
  return item;
}

export async function listMarketingRequests(): Promise<MarketingRequestRecord[]> {
  await ensureStore();
  const data = await (await database()).prepare(`SELECT id, name, platform, content_type AS contentType,
    product_name AS productName, objective, key_message AS keyMessage, promotion, language, status, source,
    submitted_at AS submittedAt FROM marketing_requests ORDER BY submitted_at DESC`).all<MarketingRequestRecord>();
  return (data as D1Result<MarketingRequestRecord>).results || [];
}
