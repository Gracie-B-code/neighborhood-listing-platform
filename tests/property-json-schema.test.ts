import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const exportedSchema = JSON.parse(
  readFileSync(
    new URL("../data/generated/property-records.schema.json", import.meta.url),
    "utf8",
  ),
) as {
  $schema: string;
  type: string;
  minItems: number;
  maxItems: number;
  items: {
    additionalProperties: boolean;
    required: string[];
    properties: Record<string, {
      minimum?: number;
      pattern?: string;
      uniqueItems?: boolean;
    }>;
  };
};

test("exports an exact-five Draft 2020-12 schema with a closed property contract", () => {
  assert.equal(exportedSchema.$schema, "https://json-schema.org/draft/2020-12/schema");
  assert.equal(exportedSchema.type, "array");
  assert.equal(exportedSchema.minItems, 5);
  assert.equal(exportedSchema.maxItems, 5);
  assert.equal(exportedSchema.items.additionalProperties, false);
  assert.deepEqual([...exportedSchema.items.required].sort(), [
    "amenities",
    "bathrooms",
    "bedrooms",
    "city",
    "currency",
    "local_sponsors",
    "price",
    "price_basis",
    "property_id",
    "square_feet",
    "state",
    "street_address",
    "zip_code",
  ].sort());
  assert.equal(exportedSchema.items.properties.price.minimum, 0);
  assert.equal(
    exportedSchema.items.properties.zip_code.pattern,
    "^\\d{5}(?:-\\d{4})?$",
  );
  assert.equal(exportedSchema.items.properties.amenities.uniqueItems, true);
});
