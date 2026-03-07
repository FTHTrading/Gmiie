// ═══════════════════════════════════════════════════════════════
// GMIIE — Mapper Validation Utilities
// Thin wrappers that validate mapper output at runtime.
// In development: throws detailed errors so drift is caught early.
// In production: logs a warning and returns the data as-is.
// ═══════════════════════════════════════════════════════════════

import { z, ZodError } from "zod";

const isDev = process.env.NODE_ENV === "development";

/**
 * Validate a single mapper result against a Zod schema.
 * Throws in dev, warn-and-passthrough in prod.
 */
export function validateOne<T>(
  schema: z.ZodType<T>,
  data: unknown,
  label: string,
): T {
  try {
    return schema.parse(data);
  } catch (err) {
    if (err instanceof ZodError) {
      const summary = err.issues
        .map((i) => `  ${i.path.join(".")}: ${i.message}`)
        .join("\n");
      const msg = `[GMIIE] Mapper validation failed for "${label}":\n${summary}`;
      if (isDev) {
        console.error(msg);
        throw new Error(msg);
      }
      console.warn(msg);
    }
    return data as T;
  }
}

/**
 * Validate an array of mapper results.
 * Returns only successfully validated items in prod (drops bad rows).
 * Throws on first failure in dev.
 */
export function validateMany<T>(
  schema: z.ZodType<T>,
  data: unknown[],
  label: string,
): T[] {
  if (isDev) {
    return data.map((item, i) => validateOne(schema, item, `${label}[${i}]`));
  }

  const results: T[] = [];
  for (let i = 0; i < data.length; i++) {
    const parsed = schema.safeParse(data[i]);
    if (parsed.success) {
      results.push(parsed.data);
    } else {
      const summary = parsed.error.issues
        .map((iss) => `  ${iss.path.join(".")}: ${iss.message}`)
        .join("\n");
      console.warn(
        `[GMIIE] Dropping invalid item at ${label}[${i}]:\n${summary}`,
      );
    }
  }
  return results;
}
