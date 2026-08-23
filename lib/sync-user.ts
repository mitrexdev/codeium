import { auth, currentUser } from "@clerk/nextjs/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

/**
 * Ensures the signed-in user exists in Convex and mirrors their Clerk
 * profile (email, names, avatar) on every dashboard entry — so first-time
 * logins are captured automatically.
 */
export async function syncCurrentUser(): Promise<string> {
  const { userId } = await auth.protect();
  if (!userId) {
    throw new Error("unauthenticated");
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? undefined;
  const firstName = user?.firstName ?? undefined;
  const lastName = user?.lastName ?? undefined;
  const imageUrl = user?.imageUrl ?? undefined;

  await fetchMutation(api.users.upsertUser, {
    clerkUserId: userId,
    ...(email && { email }),
    ...(firstName && { firstName }),
    ...(lastName && { lastName }),
    ...(imageUrl && { imageUrl }),
  });

  return userId;
}