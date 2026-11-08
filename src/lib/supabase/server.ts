import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export class SupabaseConfigurationError extends Error {
  constructor() {
    super("Supabase server configuration is incomplete");
    this.name = "SupabaseConfigurationError";
  }
}

function getPublicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new SupabaseConfigurationError();
  }

  return { url, key };
}

export async function createUserSupabaseClient() {
  const { url, key } = getPublicSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });
}
