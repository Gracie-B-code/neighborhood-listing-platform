import { z } from "zod";

import { PropertyReviewInputSchema } from "@/lib/properties/schema";
import { isSupabaseConfigurationError, requireAdmin } from "@/lib/supabase/require-admin";

const PropertyIdSchema = z.string().uuid();
const noStore = { "Cache-Control": "no-store" };

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ propertyId: string }> },
) {
  const { propertyId } = await params;
  if (!PropertyIdSchema.safeParse(propertyId).success) {
    return Response.json({ error: "Property was not found." }, {
      status: 404,
      headers: noStore,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, {
      status: 400,
      headers: noStore,
    });
  }

  const decision = PropertyReviewInputSchema.safeParse(body);
  if (!decision.success) {
    return Response.json({ error: "Review decision is invalid." }, {
      status: 400,
      headers: noStore,
    });
  }

  try {
    const authorization = await requireAdmin();
    if (!authorization.authorized) {
      return authorization.response;
    }

    const status = decision.data.decision === "approve" ? "approved" : "rejected";
    const now = new Date().toISOString();
    const { data, error } = await authorization.admin
      .from("properties")
      .update({
        status,
        review_note: decision.data.reason ?? null,
        reviewed_by: authorization.userId,
        reviewed_at: now,
        approved_at: status === "approved" ? now : null,
      })
      .eq("id", propertyId)
      .in("status", ["draft", "pending", "rejected"])
      .select("id,status")
      .maybeSingle();

    if (error) {
      console.error("Administrator property review failed.", { code: error.code });
      return Response.json({ error: "Property review could not be saved." }, {
        status: 503,
        headers: noStore,
      });
    }

    if (!data) {
      return Response.json({ error: "Property was not found or is already approved." }, {
        status: 404,
        headers: noStore,
      });
    }

    return Response.json(data, { headers: noStore });
  } catch (error) {
    if (!isSupabaseConfigurationError(error)) {
      throw error;
    }

    console.error("Administrator review is unavailable because server configuration is incomplete.");
    return Response.json({ error: "Administrator review is temporarily unavailable." }, {
      status: 503,
      headers: noStore,
    });
  }
}
