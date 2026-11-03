import { z } from "zod";

import { isSupabaseConfigurationError, requireAdmin } from "@/lib/supabase/require-admin";

const IdSchema = z.string().uuid();
const ReviewSchema = z.object({
  decision: z.enum(["approve", "reject"]),
  reason: z.string().trim().max(500).optional(),
}).strict().superRefine((value, context) => {
  if (value.decision === "reject" && !value.reason) {
    context.addIssue({
      code: "custom",
      path: ["reason"],
      message: "A reason is required when returning a relationship",
    });
  }
});
const noStore = { "Cache-Control": "no-store" };

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ propertyId: string; sponsorId: string }> },
) {
  if (request.headers.has("origin") && request.headers.get("origin") !== new URL(request.url).origin) {
    return Response.json({ error: "Request origin is not allowed." }, {
      status: 403,
      headers: noStore,
    });
  }

  const { propertyId, sponsorId } = await params;
  if (!IdSchema.safeParse(propertyId).success || !IdSchema.safeParse(sponsorId).success) {
    return Response.json({ error: "Sponsor relationship was not found." }, {
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

  const decision = ReviewSchema.safeParse(body);
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

    const { data: relationship, error: relationshipError } = await authorization.admin
      .from("property_sponsors")
      .select("status,properties!inner(status),sponsors!inner(status)")
      .eq("property_id", propertyId)
      .eq("sponsor_id", sponsorId)
      .maybeSingle();

    if (relationshipError) {
      console.error("Sponsor relationship lookup failed.", { code: relationshipError.code });
      return Response.json({ error: "Sponsor relationship could not be reviewed." }, {
        status: 503,
        headers: noStore,
      });
    }

    if (!relationship) {
      return Response.json({ error: "Sponsor relationship was not found." }, {
        status: 404,
        headers: noStore,
      });
    }

    if (decision.data.decision === "approve") {
      const property = Array.isArray(relationship.properties)
        ? relationship.properties[0]
        : relationship.properties;
      const sponsor = Array.isArray(relationship.sponsors)
        ? relationship.sponsors[0]
        : relationship.sponsors;

      if (property?.status !== "approved" || sponsor?.status !== "active") {
        return Response.json({
          error: "Approve the property and sponsor before approving their relationship.",
        }, { status: 409, headers: noStore });
      }
    }

    const { data, error } = await authorization.admin
      .from("property_sponsors")
      .update({
        status: decision.data.decision === "approve" ? "approved" : "rejected",
        review_note: decision.data.reason ?? null,
        reviewed_by: authorization.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("property_id", propertyId)
      .eq("sponsor_id", sponsorId)
      .neq("status", "approved")
      .select("property_id,sponsor_id,status")
      .maybeSingle();

    if (error) {
      console.error("Sponsor relationship review failed.", { code: error.code });
      return Response.json({ error: "Sponsor relationship could not be reviewed." }, {
        status: 503,
        headers: noStore,
      });
    }

    if (!data) {
      return Response.json({ error: "Sponsor relationship is already approved." }, {
        status: 409,
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
