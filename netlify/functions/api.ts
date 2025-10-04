import serverless from "serverless-http";
import { createServer } from "../../server";

const app = createServer();
const serverlessHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  // Ensure headers exist and are lowercase for consistent access
  const headers: Record<string, string> = {};
  if (event && event.headers) {
    for (const [k, v] of Object.entries(event.headers)) {
      headers[String(k).toLowerCase()] = String(v);
    }
  }
  event.headers = headers;

  // Netlify sometimes sends body as empty string with no content-type
  if (event.body === "" || event.body == null) {
    delete event.body;
  }

  // Default to JSON for non-GET requests when no content-type is provided
  if (
    !event.headers["content-type"] &&
    event.httpMethod &&
    event.httpMethod !== "GET"
  ) {
    event.headers["content-type"] = "application/json";
  }

  return serverlessHandler(event, context);
};
