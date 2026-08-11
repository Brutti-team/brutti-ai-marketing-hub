import { BRUTTI_LOGO_DATA_URL } from "../../brutti-logo-data";

const logoBase64 = BRUTTI_LOGO_DATA_URL.split(",", 2)[1];

export async function GET() {
  if (!logoBase64) {
    return new Response("Logo not found", { status: 404 });
  }

  return new Response(Buffer.from(logoBase64, "base64"), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
