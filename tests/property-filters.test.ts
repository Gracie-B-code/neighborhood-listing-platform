import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { filterProperties } from "../src/lib/properties/filter";
import { PropertyRecordListSchema } from "../src/lib/properties/schema";

const fixture = JSON.parse(
  readFileSync(new URL("../data/generated/synthetic-property-examples.json", import.meta.url), "utf8"),
) as { records: unknown[] };
const properties = PropertyRecordListSchema.parse(fixture.records);

test("filters property fixtures by price basis", () => {
  const result = filterProperties(properties, {
    priceBasis: "monthly_rent",
    minBedrooms: "",
    maxPrice: "",
  });

  assert.equal(result.length, 2);
  assert.ok(result.every((property) => property.price_basis === "monthly_rent"));
});

test("filters by bedroom minimum and maximum price together", () => {
  const result = filterProperties(properties, {
    priceBasis: "all",
    minBedrooms: 2,
    maxPrice: 3000,
  });

  assert.equal(result.length, 2);
  assert.ok(result.every((property) => property.bedrooms >= 2 && property.price <= 3000));
});

test("returns no records when criteria do not match", () => {
  const result = filterProperties(properties, {
    priceBasis: "purchase",
    minBedrooms: 5,
    maxPrice: 1000,
  });

  assert.deepEqual(result, []);
});
