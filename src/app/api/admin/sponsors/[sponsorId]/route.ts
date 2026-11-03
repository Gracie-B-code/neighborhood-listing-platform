import { z } from "zod";

import { isSupabaseConfigurationError, requireAdmin } from "@/lib/supabase/require-admin";

const SponsorIdSchema = z.string().uuid();
const SponsorReviewSchema = z.object({
  decision: z.enum(["approve", "reject"]),
  reason: z.string().trim().max(500).optional(),
}).strict().superRefine((value, context) => {
  if (value.decision === "reject" && !value.reason) {
    context.addIssue({
      code: "custom",
      path: ["reason"],
      message: "A reason is required when returning a sponsor",
    });
  }
});
const noStore = { "Cache-Control": "no-store" };

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sponsorId: string }> },
) {
  const { sponsorId } = await params;
  if (!SponsorIdSchema.safeParse(sponsorId).success) {
    return Response.json({ error: "Sponsor was not found." }, {
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

  const decision = SponsorReviewSchema.safeParse(body);
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

    const status = decision.data.decision === "approve" ? "active" : "rejected";
    const now = new Date().toISOString();
    const { data, error } = await authorization.admin
      .from("sponsors")
      .update({
        status,
        review_note: decision.data.reason ?? null,
        reviewed_by: authorization.userId,
        reviewed_at: now,
        active_at: status === "active" ? now : null,
      })
      .eq("id", sponsorId)
      .in("status", ["draft", "pending", "rejected"])
      .select("id,status")
      .maybeSingle();

    if (error) {
      console.error("Administrator sponsor review failed.", { code: error.code });
      return Response.json({ error: "Sponsor review could not be saved." }, {
        status: 503,
        headers: noStore,
      });
    }

    if (!data) {
      return Response.json({ error: "Sponsor was not found or is already active." }, {
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
