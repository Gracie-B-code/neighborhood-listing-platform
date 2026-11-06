import { z } from "zod";

import {
  CreateServiceInputSchema,
  ServiceRecordListSchema,
  ServiceRecordSchema,
} from "@/schemas/service";
import {
  createUserSupabaseClient,
  SupabaseConfigurationError,
} from "@/lib/supabase/server";

const ServiceRoleSchema = z.object({
  role: z.enum(["provider", "client", "admin"]),
}).strict();

const ServiceRowSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  city: z.string(),
  state: z.string(),
  zip_code: z.string(),
  rate_amount: z.number().nullable(),
  currency: z.string(),
  rate_unit: z.string(),
  created_at: z.string(),
}).strict();

const publicServiceColumns =
  "id,title,description,category,city,state,zip_code,rate_amount,currency,rate_unit,created_at";
const noStore = { "Cache-Control": "no-store" };

function unavailable(message: string, status = 503) {
  return Response.json({ error: message }, { status, headers: noStore });
}

export async function GET() {
  let supabase;
  try {
    supabase = await createUserSupabaseClient();
  } catch (error) {
    if (!(error instanceof SupabaseConfigurationError)) {
      throw error;
    }

    console.error("Service listings are unavailable because server configuration is incomplete.");
    return unavailable("Services are temporarily unavailable.");
  }

  const { data, error } = await supabase
    .from("services")
    .select(publicServiceColumns)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Public service query failed.", { code: error.code });
    return unavailable("Services are temporarily unavailable.");
  }

  const rows = z.array(ServiceRowSchema).safeParse(data);
  if (!rows.success) {
    console.error("Public service data did not match the expected database shape.");
    return unavailable("Services are temporarily unavailable.", 500);
  }

  const result = ServiceRecordListSchema.safeParse(rows.data);
  if (!result.success) {
    console.error("Public service data failed contract validation.");
    return unavailable("Services are temporarily unavailable.", 500);
  }

  return Response.json(result.data, { headers: noStore });
}

export async function POST(request: Request) {
  if (
    request.headers.has("origin")
    && request.headers.get("origin") !== new URL(request.url).origin
  ) {
    return unavailable("Request origin is not allowed.", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return unavailable("Request body must be valid JSON.", 400);
  }

  const input = CreateServiceInputSchema.safeParse(body);
  if (!input.success) {
    return Response.json({
      error: "Service data is invalid.",
      fields: input.error.flatten().fieldErrors,
    }, { status: 400, headers: noStore });
  }

  let supabase;
  try {
    supabase = await createUserSupabaseClient();
  } catch (error) {
    if (!(error instanceof SupabaseConfigurationError)) {
      throw error;
    }

    console.error("Service submission is unavailable because server configuration is incomplete.");
    return unavailable("Service submission is temporarily unavailable.");
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    if (
      authError.name === "AuthSessionMissingError"
      || authError.status === 401
      || authError.status === 403
    ) {
      return unavailable("Sign in with a provider account to submit a service.", 401);
    }

    console.error("Service submission authentication failed.", { code: authError.status });
    return unavailable("Sign-in could not be verified.");
  }
  if (!authData.user) {
    return unavailable("Sign in with a provider account to submit a service.", 401);
  }

  const { data: profile, error: profileError } = await supabase
    .from("service_profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Service provider role lookup failed.", { code: profileError.code });
    return unavailable("Service submission authorization is unavailable.");
  }

  const role = ServiceRoleSchema.safeParse(profile);
  if (!role.success || role.data.role !== "provider") {
    return unavailable("A provider account is required to submit a service.", 403);
  }

  const { data, error } = await supabase
    .from("services")
    .insert(input.data)
    .select(publicServiceColumns)
    .single();

  if (error) {
    console.error("Service submission failed.", { code: error.code });
    return unavailable("Service could not be submitted.", 422);
  }

  const service = ServiceRecordSchema.safeParse(data);
  if (!service.success) {
    console.error("Submitted service did not match the expected database shape.");
    return unavailable("Service could not be submitted.", 500);
  }

  return Response.json({
    service: service.data,
    status: "pending",
  }, { status: 201, headers: noStore });
}
