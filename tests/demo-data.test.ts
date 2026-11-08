import assert from "node:assert/strict";
import { test } from "node:test";

import { PropertyRecordListSchema, SponsorRecordSchema } from "../src/lib/properties/schema";
import { demoProperties, demoServices, demoSponsors } from "../src/lib/demo-data";
import { ServiceRecordListSchema } from "../src/schemas/service";

test("read-only demo data matches the local approved sample records", () => {
  assert.equal(PropertyRecordListSchema.parse(demoProperties).length, 3);
  assert.equal(ServiceRecordListSchema.parse(demoServices).length, 1);
  assert.deepEqual(
    demoSponsors.map((sponsor) => SponsorRecordSchema.parse(sponsor).sponsor_id),
    [
      "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    ],
  );
});
