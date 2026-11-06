import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  CreatePropertyInputSchema,
  PropertyRecordListSchema,
  PropertyRecordSchema,
} from "../src/lib/properties/schema";

const fixture = JSON.parse(
  readFileSync(new URL("../data/generated/synthetic-property-examples.json", import.meta.url), "utf8"),
) as { records: unknown[] };
const validRecord = fixture.records[0];

test("accepts each locally authored synthetic property fixture", () => {
  const result = PropertyRecordListSchema.safeParse(fixture.records);

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.length, 5);
  }
});

test("accepts a create input without the optional address line or sponsor IDs", () => {
  const input = { ...(validRecord as Record<string, unknown>) };
  delete input.property_id;
  delete input.local_sponsors;
  const result = CreatePropertyInputSchema.safeParse(input);

  assert.equal(result.success, true);
  if (result.success) {
    assert.deepEqual(result.data.local_sponsors, []);
  }
});

test("rejects a missing property_id", () => {
  const withoutPropertyId = { ...(validRecord as Record<string, unknown>) };
  delete withoutPropertyId.property_id;
  const result = PropertyRecordSchema.safeParse(withoutPropertyId);

  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.error.issues.some((issue) => issue.path.join(".") === "property_id"));
  }
});

test("rejects a negative price at the price field", () => {
  const result = PropertyRecordSchema.safeParse({
    ...(validRecord as object),
    price: -1,
  });

  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.error.issues.some((issue) => issue.path.join(".") === "price"));
  }
});

test("rejects an invalid ZIP code at the zip_code field", () => {
  const result = PropertyRecordSchema.safeParse({
    ...(validRecord as object),
    zip_code: "9A001",
  });

  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.error.issues.some((issue) => issue.path.join(".") === "zip_code"));
  }
});

test("rejects unknown property fields", () => {
  const result = PropertyRecordSchema.safeParse({
    ...(validRecord as object),
    admin: true,
  });

  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.error.issues.some((issue) => issue.code === "unrecognized_keys"));
  }
});
