import { readFileSync } from "node:fs";
import { google } from "googleapis";

const SCOPES = ["https://mail.google.com/"];

function toBase64Url(raw: string): string {
  return Buffer.from(raw, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function isGmailNotifyConfigured(): boolean {
  return Boolean(
    process.env.GMAIL_SERVICE_ACCOUNT_PATH &&
      process.env.GMAIL_DELEGATED_USER &&
      process.env.LEADS_NOTIFY_TO
  );
}

export type LeadPayload = {
  type: "waitlist" | "demo";
  name: string;
  email: string;
  referrer?: string;
};

export async function sendLeadNotification(lead: LeadPayload): Promise<void> {
  if (!isGmailNotifyConfigured()) return;

  const keyPath = process.env.GMAIL_SERVICE_ACCOUNT_PATH as string;
  const delegatedUser = process.env.GMAIL_DELEGATED_USER as string;
  const toRaw = process.env.LEADS_NOTIFY_TO as string;
  const toList = toRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (toList.length === 0) return;

  let credentials: { client_email: string; private_key: string };
  try {
    credentials = JSON.parse(readFileSync(keyPath, "utf8")) as {
      client_email: string;
      private_key: string;
    };
  } catch {
    console.error("[gmail] Could not read service account JSON at", keyPath);
    return;
  }

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: SCOPES,
    subject: delegatedUser,
  });

  const gmail = google.gmail({ version: "v1", auth });

  const subjectText =
    lead.type === "demo"
      ? `[Friday] Demo request - ${lead.name}`
      : `[Friday] Waitlist - ${lead.name}`;

  // RFC 2047 encode subject to handle any non-ASCII characters safely
  const encodedSubject = `=?UTF-8?B?${Buffer.from(subjectText, "utf8").toString("base64")}?=`;

  const bodyLines = [
    `Type    : ${lead.type === "demo" ? "Demo Request" : "Waitlist"}`,
    `Name    : ${lead.name}`,
    `Email   : ${lead.email}`,
    ...(lead.type === "demo"
      ? [`Referrer: ${lead.referrer || "(none)"}`]
      : []),
    ``,
    `Submitted: ${new Date().toISOString()}`,
    `Source   : launch-site`,
  ];

  const rawMessage = [
    `To: ${toList.join(", ")}`,
    `From: ${delegatedUser}`,
    `Subject: ${encodedSubject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset=utf-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    "",
    bodyLines.join("\r\n"),
  ].join("\r\n");

  try {
    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: toBase64Url(rawMessage) },
    });
  } catch (e) {
    console.error("[gmail] send failed:", e instanceof Error ? e.message : e);
  }
}
