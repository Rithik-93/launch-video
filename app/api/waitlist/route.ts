import { NextResponse, type NextRequest } from "next/server";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function asTrimmedString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s.length ? s : null;
}

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBAPP_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { ok: false, error: "Server is missing GOOGLE_SHEETS_WEBAPP_URL" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const type = b.type;

  if (type !== "waitlist" && type !== "demo") {
    return NextResponse.json(
      { ok: false, error: "Invalid request type." },
      { status: 400 }
    );
  }

  const name = asTrimmedString(b.name);
  if (!name || name.length < 2) {
    return NextResponse.json(
      { ok: false, error: "Please enter your name." },
      { status: 400 }
    );
  }

  const email = asTrimmedString(b.email);
  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Please enter a valid email." },
      { status: 400 }
    );
  }

  // referrer is optional — only present on demo submissions
  const referrer = type === "demo" ? (asTrimmedString(b.referrer) ?? "") : "";

  const payload = {
    type,
    name,
    email: email.toLowerCase(),
    ...(type === "demo" ? { referrer } : {}),
    createdAt: new Date().toISOString(),
    source: "launch-site",
    ...(process.env.WAITLIST_WEBHOOK_SECRET
      ? { secret: process.env.WAITLIST_WEBHOOK_SECRET }
      : {}),
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await res.text().catch(() => "");

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: "Failed to write to Google Sheets.", details: text.slice(0, 500) },
        { status: 502 }
      );
    }

    try {
      const parsed = JSON.parse(text) as { ok?: boolean; error?: string };
      if (parsed?.ok !== true) {
        return NextResponse.json(
          { ok: false, error: parsed?.error ?? "Google Sheets webhook returned an error.", details: text.slice(0, 500) },
          { status: 502 }
        );
      }
    } catch {
      return NextResponse.json(
        { ok: false, error: "Google Sheets webhook returned an unexpected response.", details: text.slice(0, 500) },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Network error writing to Google Sheets." },
      { status: 502 }
    );
  }
}
