import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const installationId = url.searchParams.get("installation_id");
  const setupAction = url.searchParams.get("setup_action");

  if (!installationId || (setupAction && setupAction !== "install")) {
    redirect("/dashboard/connectors");
  }

  const { userId } = await auth.protect();

  await fetchMutation(api.users.upsertUser, {
    clerkUserId: userId,
    githubInstallationId: installationId,
  });

  redirect("/dashboard/connectors");
}
