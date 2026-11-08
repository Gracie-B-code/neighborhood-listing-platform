import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import { PropertyRecordBatchSchema } from "../src/lib/properties/schema";

const FixtureFileSchema = z.object({
  label: z.string().min(1),
  generated_by: z.string().min(1),
  records: PropertyRecordBatchSchema,
}).strict();
const fixturePath = resolve("data/generated/synthetic-property-examples.json");
const source = readFileSync(fixturePath, "utf8");

let fixture: unknown;
try {
  fixture = JSON.parse(source);
} catch (error) {
  if (!(error instanceof SyntaxError)) {
    throw error;
  }
  console.error(`Invalid JSON in ${fixturePath}: ${error.message}`);
  process.exitCode = 1;
  fixture = undefined;
}

if (fixture !== undefined) {
  const result = FixtureFileSchema.safeParse(fixture);
  if (!result.success) {
    console.error(`Validation failed for ${fixturePath}:`);
    for (const issue of result.error.issues) {
      const path = issue.path.length ? issue.path.join(".") : "(root)";
      console.error(`- ${path}: ${issue.message}`);
    }
    process.exitCode = 1;
  } else {
    console.log(
      `Validation passed: ${result.data.records.length} synthetic property records conform to the Zod source schema.`,
    );
  }
}
