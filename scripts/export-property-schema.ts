import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { PropertyRecordBatchSchema } from "../src/lib/properties/schema";

const schema = z.toJSONSchema(PropertyRecordBatchSchema, {
  target: "draft-2020-12",
});
const outputPath = resolve("data/generated/property-records.schema.json");

writeFileSync(outputPath, `${JSON.stringify(schema, null, 2)}\n`, "utf8");
console.log(`Exported Draft 2020-12 JSON Schema to ${outputPath}`);
