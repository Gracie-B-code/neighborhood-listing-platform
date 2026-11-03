import { z } from "zod";

import {
  CreatePropertyInputSchema,
  PropertyRecordListSchema,
} from "@/lib/properties/schema";
import {
  createUserSupabaseClient,
  SupabaseConfigurationError,
} from "@/lib/supabase/server";

const PublicPropertyRowSchema = z.object({
  id: z.string().uuid(),
  street_address: z.string(),
  address_line_2: z.string().nullable(),
  city: z.string(),
  state: z.string(),
  zip_code: z.string(),
  price: z.number(),
  price_basis: z.string(),
  currency: z.string(),
  bedrooms: z.number(),
  bathrooms: z.number(),
  square_feet: z.number(),
  amenities: z.array(z.string()),
  property_sponsors: z.array(z.object({
    sponsor_id: z.string().uuid(),
    sponsor: z.object({
      id: z.string().uuid(),
      name: z.string(),
    }).nullable(),
  }).strict()),
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

    console.error("Public listings are unavailable because server configuration is incomplete.");
    return Response.json({ error: "Listings are temporarily unavailable." }, {
      status: 503,
      headers: noStore,
    });
  }

  const { data, error } = await supabase
    .from("properties")
    .select(
      "id,street_address,address_line_2,city,state,zip_code,price,price_basis,currency,bedrooms,bathrooms,square_feet,amenities,property_sponsors(sponsor_id,sponsor:sponsors(id,name))",
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Public listing query failed.", { code: error.code });
    return Response.json({ error: "Listings are temporarily unavailable." }, {
      status: 503,
      headers: noStore,
    });
  }

  const rows = z.array(PublicPropertyRowSchema).safeParse(data);
  if (!rows.success) {
    console.error("Public listing data did not match the expected database shape.");
    return Response.json({ error: "Listings are temporarily unavailable." }, {
      status: 500,
      headers: noStore,
    });
  }

  const listings = rows.data.map((row) => ({
    property_id: row.id,
    street_address: row.street_address,
    ...(row.address_line_2 ? { address_line_2: row.address_line_2 } : {}),
    city: row.city,
    state: row.state,
    zip_code: row.zip_code,
    price: row.price,
    price_basis: row.price_basis,
    currency: row.currency,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    square_feet: row.square_feet,
    amenities: row.amenities,
    local_sponsors: row.property_sponsors.flatMap(({ sponsor_id, sponsor }) => {
      if (!sponsor) {
        return [];
      }

      return [{
        sponsor_id,
        name: sponsor.name,
      }];
    }),
  }));
  const validatedListings = PropertyRecordListSchema.safeParse(listings);

  if (!validatedListings.success) {
    console.error("Public listing data failed contract validation.");
    return Response.json({ error: "Listings are temporarily unavailable." }, {
      status: 500,
      headers: noStore,
    });
  }

  return Response.json(validatedListings.data, { headers: noStore });
}

export async function POST(request: Request) {
  if (request.headers.has("origin") && request.headers.get("origin") !== new URL(request.url).origin) {
    return Response.json({ error: "Request origin is not allowed." }, {
      status: 403,
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

  const input = CreatePropertyInputSchema.safeParse(body);
  if (!input.success) {
    return Response.json({
      error: "Property data is invalid.",
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

    console.error("Property submission is unavailable because server configuration is incomplete.");
    return Response.json({ error: "Property submission is temporarily unavailable." }, {
      status: 503,
      headers: noStore,
    });
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error("Property submission authentication failed.", { code: authError.status });
    return Response.json({ error: "Sign-in could not be verified." }, {
      status: 503,
      headers: noStore,
    });
  }

  if (!authData.user) {
    return Response.json({ error: "Sign in to submit a property." }, {
      status: 401,
      headers: noStore,
    });
  }

  const { data: propertyId, error } = await supabase.rpc("create_property_with_sponsors", {
    p_input: input.data,
  });

  if (error) {
    console.error("Property submission failed.", { code: error.code });
    return Response.json({ error: "Property could not be submitted." }, {
      status: 422,
      headers: noStore,
    });
  }

  return Response.json({
    property_id: propertyId,
    status: "pending",
  }, { status: 201, headers: noStore });
}
