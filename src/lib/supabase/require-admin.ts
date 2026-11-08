import { createAdminSupabaseClient } from "./admin";
import {
  createUserSupabaseClient,
  SupabaseConfigurationError,
} from "./server";

export type AdminCheck =
  | { authorized: true; admin: ReturnType<typeof createAdminSupabaseClient>; userId: string }
  | { authorized: false; response: Response };

export async function requireAdmin(): Promise<AdminCheck> {
  const userClient = await createUserSupabaseClient();
  const { data: authData, error: authError } = await userClient.auth.getUser();

  if (authError) {
    console.error("Administrator authentication could not be verified.", { code: authError.status });
    return {
      authorized: false,
      response: Response.json({ error: "Sign-in could not be verified." }, { status: 503 }),
    };
  }

  if (!authData.user) {
    return {
      authorized: false,
      response: Response.json({ error: "Administrator sign-in is required." }, { status: 401 }),
    };
  }

  const admin = createAdminSupabaseClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Administrator profile lookup failed.", { code: profileError.code });
    return {
      authorized: false,
      response: Response.json({ error: "Administrator authorization is unavailable." }, { status: 503 }),
    };
  }

  if (profile?.role !== "admin") {
    return {
      authorized: false,
      response: Response.json({ error: "Administrator access is required." }, { status: 403 }),
    };
  }

  return { authorized: true, admin, userId: authData.user.id };
}

export function isSupabaseConfigurationError(error: unknown): error is SupabaseConfigurationError {
  return error instanceof SupabaseConfigurationError;
}
