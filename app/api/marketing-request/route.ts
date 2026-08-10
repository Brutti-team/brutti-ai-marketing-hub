import { NextResponse } from "next/server";

const requiredFields = [
  "name",
  "platform",
  "contentType",
  "objective",
  "language",
] as const;

type MarketingRequest = Record<(typeof requiredFields)[number], string> & {
  productName?: string;
  keyMessage?: string;
  promotion?: string;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const webhookUrl = process.env.MAKE_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json(
      { error: "The Make connection is not configured yet." },
      { status: 503 },
    );
  }

  let body: Partial<MarketingRequest>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const missing = requiredFields.filter((field) => !clean(body[field]));

  if (missing.length > 0) {
    return NextResponse.json(
      { error: "Please complete all required fields." },
      { status: 400 },
    );
  }

  const payload = {
    name: clean(body.name),
    platform: clean(body.platform),
    contentType: clean(body.contentType),
    productName: clean(body.productName),
    objective: clean(body.objective),
    keyMessage: clean(body.keyMessage),
    promotion: clean(body.promotion),
    language: clean(body.language),
    status: "New",
    source: "BRUTTI AI Marketing Hub",
    submittedAt: new Date().toISOString(),
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Make could not receive this request. Please try again." },
        { status: 502 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Make could not receive this request. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
