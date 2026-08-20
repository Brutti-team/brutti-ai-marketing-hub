import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const marketingContent = sqliteTable("marketing_content", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  platform: text("platform").notNull().default("Facebook"),
  contentType: text("content_type").notNull().default("Facebook Post"),
  productName: text("product_name").notNull().default(""),
  content: text("content").notNull(),
  status: text("status").notNull().default("Review"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  publishedAt: text("published_at"),
});

export const contentCalendar = sqliteTable("content_calendar", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull().default(""),
  platform: text("platform").notNull().default("Facebook"),
  contentType: text("content_type").notNull().default("Facebook Post"),
  productName: text("product_name").notNull().default(""),
  notes: text("notes").notNull().default(""),
  status: text("status").notNull().default("Draft"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const marketingRequests = sqliteTable("marketing_requests", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  platform: text("platform").notNull().default("Facebook"),
  contentType: text("content_type").notNull().default("Facebook Post"),
  productName: text("product_name").notNull().default(""),
  objective: text("objective").notNull(),
  keyMessage: text("key_message").notNull().default(""),
  promotion: text("promotion").notNull().default(""),
  language: text("language").notNull(),
  status: text("status").notNull().default("New"),
  source: text("source").notNull(),
  submittedAt: text("submitted_at").notNull(),
});
