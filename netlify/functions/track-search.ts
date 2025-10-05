const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
};

export const handler = async (event: any) => {
  const method = (event.httpMethod || "GET").toUpperCase();
  if (method === "OPTIONS") {
    return { statusCode: 204, headers: { ...corsHeaders } };
  }
  if (method !== "POST") {
    return {
      statusCode: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const DEFAULT_WEBHOOK = "https://discord.com/api/webhooks/1424475450561794181/QVQwLWIBisqQOfwaCObvBPIMmPziMLVaudIoI79l6iml-_d-olseeicP2mKXGoshlkb7";
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL || DEFAULT_WEBHOOK;

  const raw = event.isBase64Encoded
    ? Buffer.from(event.body || "", "base64").toString("utf-8")
    : event.body || "";

  let payload: any = {};
  try {
    payload = JSON.parse(raw || "{}");
  } catch {
    payload = {};
  }

  const email = typeof payload.email === "string" ? payload.email : "unknown";
  const query = typeof payload.query === "string" ? payload.query : "";
  const found = typeof payload.found === "boolean" ? payload.found : false;
  const ts = typeof payload.timestamp === "string" ? payload.timestamp : new Date().toISOString();

  if (!query) {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing query" }),
    };
  }

  const status = found ? "\u2713" : "\u2717"; // ✓ or ✗
  const content = [
    `Search event`,
    `Email: ${email}`,
    `Query: ${query}`,
    `Time: ${ts}`,
    `Status: ${status}`,
  ].join("\n");

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  } catch (e) {
    // Ignore webhook errors
    console.warn("Discord webhook error", e);
  }

  return { statusCode: 204, headers: { ...corsHeaders } };
};
