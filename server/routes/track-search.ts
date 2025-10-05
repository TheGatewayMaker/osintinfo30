import type { RequestHandler } from "express";

export const handleTrackSearch: RequestHandler = async (req, res) => {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
      res.status(204).end();
      return;
    }

    const body = (req.body ?? {}) as Record<string, unknown>;
    const email = typeof body.email === "string" ? body.email : "unknown";
    const query = typeof body.query === "string" ? body.query : "";
    const found = typeof body.found === "boolean" ? body.found : false;
    const ts =
      typeof body.timestamp === "string"
        ? body.timestamp
        : new Date().toISOString();

    if (!query) {
      res.status(400).json({ error: "Missing query" });
      return;
    }

    const status = found ? "\u2713" : "\u2717"; // ✓ or ✗
    const content = [
      `Search event`,
      `Email: ${email}`,
      `Query: ${query}`,
      `Time: ${ts}`,
      `Status: ${status}`,
    ].join("\n");

    // Discord webhook expects { content }
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    res.status(204).end();
  } catch (e) {
    console.warn("Track webhook failed", e);
    res.status(200).json({ ok: true });
  }
};
