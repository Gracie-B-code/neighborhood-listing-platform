import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CreateServiceInputSchema,
  ServiceRecordListSchema,
} from "../src/schemas/service";

const validInput = {
  title: "Fictional home repair",
  description: "Synthetic example of a local home repair service.",
  category: "home_repair",
  city: "Sampleton",
  state: "CA",
  zip_code: "90001",
  rate_amount: 75,
  currency: "USD",
  rate_unit: "hour",
};

const validService = {
  id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  ...validInput,
  created_at: "2026-11-06T08:00:00+00:00",
};

test("accepts a valid service record and provider submission", () => {
  assert.equal(ServiceRecordListSchema.safeParse([validService]).success, true);

  assert.equal(CreateServiceInputSchema.safeParse(validInput).success, true);
});

test("rejects unknown service fields", () => {
  const result = CreateServiceInputSchema.safeParse({ ...validInput, status: "approved" });

  assert.equal(result.success, false);
  if (!result.success) {
    assert.ok(result.error.issues.some((issue) => issue.code === "unrecognized_keys"));
  }
});

test("rejects negative rates and malformed location data", () => {
  const negativeRate = CreateServiceInputSchema.safeParse({ ...validInput, rate_amount: -1 });
  const invalidLocation = CreateServiceInputSchema.safeParse({ ...validInput, zip_code: "bad" });

  assert.equal(negativeRate.success, false);
  assert.equal(invalidLocation.success, false);
});

test("accepts an explicitly unpriced service", () => {
  const result = CreateServiceInputSchema.safeParse({ ...validInput, rate_amount: null });

  assert.equal(result.success, true);
});
