import { z } from "zod";

import { SponsorRecordSchema } from "@/lib/properties/schema";
import {
  createUserSupabaseClient,
  SupabaseConfigurationError,
} from "@/lib/supabase/server";

const SponsorRowSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  category: z.string(),
  website_url: z.string().nullable(),
  claims: z.array(z.string()),
}).strict();

const noStore = { "Cache-Control": "no-store" };

export async function GET() {
  let supabase;
  try {
    supabase = await createUserSupabaseClient();
  } catch (error) {
    if (!(error instanceof SupabaseConfigurationError)) {
      throw error;
    }

    console.error("Sponsor listings are unavailable because server configuration is incomplete.");
    return Response.json({ error: "Sponsors are temporarily unavailable." }, {
      status: 503,
      headers: noStore,
    });
  }

  const { data, error } = await supabase
    .from("sponsors")
    .select("id,name,category,website_url,claims")
    .eq("status", "active")
    .order("name", { ascending: true });

  if (error) {
    console.error("Public sponsor query failed.", { code: error.code });
    return Response.json({ error: "Sponsors are temporarily unavailable." }, {
      status: 503,
      headers: noStore,
    });
  }

  const rows = z.array(SponsorRowSchema).safeParse(data);
  if (!rows.success) {
    console.error("Public sponsor data did not match the expected database shape.");
    return Response.json({ error: "Sponsors are temporarily unavailable." }, {
      status: 500,
      headers: noStore,
    });
  }

  const sponsors = rows.data.map((row) => ({
    sponsor_id: row.id,
    name: row.name,
    category: row.category,
    website_url: row.website_url,
    claims: row.claims,
  }));
  const result = z.array(SponsorRecordSchema).safeParse(sponsors);

  if (!result.success) {
    console.error("Public sponsor data failed contract validation.");
    return Response.json({ error: "Sponsors are temporarily unavailable." }, {
      status: 500,
      headers: noStore,
    });
  }

  return Response.json(result.data, { headers: noStore });
}
