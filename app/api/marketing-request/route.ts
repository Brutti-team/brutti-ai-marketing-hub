import { NextResponse } from "next/server";
import { createMarketingRequest, listMarketingRequests } from "../../lib/brutti-store";

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

  const item = await createMarketingRequest({
    name: clean(body.name),
    platform: clean(body.platform),
    contentType: clean(body.contentType),
    productName: clean(body.productName),
    objective: clean(body.objective),
    keyMessage: clean(body.keyMessage),
    promotion: clean(body.promotion),
    language: clean(body.language),
  });

  return NextResponse.json({ ok: true, item });
}

export async function GET() {
  try {
    return NextResponse.json({ items: await listMarketingRequests() });
  } catch {
    return NextResponse.json({ error: "Requests could not be loaded." }, { status: 500 });
  }
}
