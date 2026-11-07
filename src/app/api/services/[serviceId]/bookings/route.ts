import { z } from "zod";

import {
  ServiceBookingRecordSchema,
} from "@/schemas/service";
import {
  createUserSupabaseClient,
  SupabaseConfigurationError,
} from "@/lib/supabase/server";

const ServiceIdSchema = z.string().uuid();
const noStore = { "Cache-Control": "no-store" };

function unavailable(message: string, status = 503) {
  return Response.json({ error: message }, { status, headers: noStore });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ serviceId: string }> },
) {
  if (
    request.headers.has("origin")
    && request.headers.get("origin") !== new URL(request.url).origin
  ) {
    return unavailable("Request origin is not allowed.", 403);
  }

  const { serviceId } = await params;
  if (!ServiceIdSchema.safeParse(serviceId).success) {
    return unavailable("Service was not found.", 404);
  }

  let supabase;
  try {
    supabase = await createUserSupabaseClient();
  } catch (error) {
    if (!(error instanceof SupabaseConfigurationError)) {
      throw error;
    }

    console.error("Service request is unavailable because server configuration is incomplete.");
    return unavailable("Service request is temporarily unavailable.");
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    if (
      authError.name === "AuthSessionMissingError"
      || authError.status === 401
      || authError.status === 403
    ) {
      return unavailable("Sign in with a client account to request a service.", 401);
    }

    console.error("Service request authentication failed.", { code: authError.status });
    return unavailable("Sign-in could not be verified.");
  }
  if (!authData.user) {
    return unavailable("Sign in with a client account to request a service.", 401);
  }

  const { data: profile, error: profileError } = await supabase
    .from("service_profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Service client role lookup failed.", { code: profileError.code });
    return unavailable("Service request authorization is unavailable.");
  }
  if (profile?.role !== "client") {
    return unavailable("A client account is required to request a service.", 403);
  }

  const { data, error } = await supabase
    .from("service_bookings")
    .insert({ service_id: serviceId })
    .select("id,service_id,status,requested_at,created_at")
    .single();

  if (error) {
    console.error("Service request could not be saved.", { code: error.code });
    return unavailable("Service request could not be saved.", 422);
  }

  const booking = ServiceBookingRecordSchema.safeParse(data);
  if (!booking.success) {
    console.error("Service request did not match the expected database shape.");
    return unavailable("Service request could not be saved.", 500);
  }

  return Response.json(booking.data, { status: 201, headers: noStore });
}
