import { NextResponse, type NextRequest } from "next/server";
import axios from "axios";
import { sendLeadNotification } from "@/lib/gmail-send";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function asTrimmedString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s.length ? s : null;
}

const GOOGLE_SHEETS_WEBAPP_URL = process.env.GOOGLE_SHEETS_WEBAPP_URL;

if (!GOOGLE_SHEETS_WEBAPP_URL) {
  throw new Error("GOOGLE_SHEETS_WEBAPP_URL is not set");
}

export async function POST(req: NextRequest) {
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

  const referrer = type === "demo" ? (asTrimmedString(b.referrer) ?? "") : "";

  // Demo requests: send exactly like test.ts (type, name, email, referrer, createdAt, source)
  const payload =
    type === "demo"
      ? {
          type: "demo",
          name,
          email: email.toLowerCase(),
          referrer,
          createdAt: new Date().toISOString(),
          source: "launch-site"
        }
      : {
          type: "waitlist",
          name,
          email: email.toLowerCase(),
          createdAt: new Date().toISOString(),
          source: "launch-site"
        };

  try {
    const res = await axios.post(GOOGLE_SHEETS_WEBAPP_URL as string, payload, {
      headers: { "Content-Type": "application/json" },
      maxBodyLength: Infinity,
    });

    if (res.status !== 200 || res.data?.ok !== true) {
      return NextResponse.json(
        { ok: false, error: "Failed to write to Google Sheets.", details: JSON.stringify(res.data)?.slice(0, 500) },
        { status: 502 }
      );
    }

    await sendLeadNotification({
      type,
      name,
      email: email.toLowerCase(),
      ...(type === "demo" && referrer ? { referrer } : {}),
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { ok: false, error: "Failed to write to Google Sheets.", details },
      { status: 502 }
    );
  }
}
