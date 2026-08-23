import { verify } from "@octokit/webhooks-methods";
import { inngest } from "@/inngest/client";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret || !signature) {
    return Response.json({ error: "missing signature or secret" }, { status: 400 });
  }

  const valid = await verify(secret, body, signature);
  if (!valid) {
    return Response.json({ error: "invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(body);

  await inngest.send({
    name: "github/event.received",
    data: {
      eventName: request.headers.get("x-github-event") ?? "unknown",
      deliveryId: request.headers.get("x-github-delivery") ?? "",
      payload,
    },
  });

  return Response.json({ ok: true });
}
