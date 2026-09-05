/* @layer renderer-components @kind logic */
/**
 * Kind inference, the trickiest derivation here.
 *
 * Types are erased at runtime, so the schema is read off the values. Sampling
 * EVERY row (collections here are in the hundreds) makes enum and optional
 * detection exact, not probabilistic.
 *
 * Inference can only be wrong in one direction: a free-text field that happens
 * to hold few distinct values in this dataset reads as an enum. That is what
 * `SchemaConfig.kinds` is for: a one-line override that leaves the derived base
 * untouched.
 */
import type { FieldKind } from './field-descriptor';

/**
 * The `<prefix>-<digits>` reference convention this app's collections use. The
 * prefix names the collection an id points at; nothing here knows what those
 * collections contain.
 */
const ID_RE = /^(screen|connection|check|item|dungeon|area|location|actor|tag)-\d+$/;

/** Distinct string values at or under this count read as a closed set. */
const ENUM_MAX = 12;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const present = (values: readonly unknown[]): readonly unknown[] =>
  values.filter((v) => v !== undefined && v !== null);

/**
 * A union is a set of objects that do NOT all share every key with the same
 * primitive-vs-object shape, so they are variant branches instead of one record
 * shape with the same fields throughout.
 */
const shapeOf = (value: unknown): 'container' | 'primitive' =>
  typeof value === 'object' && value !== null ? 'container' : 'primitive';

/** The present (non-null/undefined) keys one sampled object carries. */
const keySignature = (obj: Record<string, unknown>): ReadonlySet<string> =>
  new Set(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null).map(([k]) => k));

const isSubsetOf = (a: ReadonlySet<string>, b: ReadonlySet<string>): boolean =>
  [...a].every((key) => b.has(key));

/** Distinct key-sets across the sample, so branch count drives the check, not row count. */
const distinctSignatures = (objects: readonly Record<string, unknown>[]): readonly ReadonlySet<string>[] => {
  const bySerial = new Map<string, ReadonlySet<string>>();
  for (const obj of objects) {
    const signature = keySignature(obj);
    const serial = [...signature].sort().join(',');
    if (!bySerial.has(serial)) bySerial.set(serial, signature);
  }
  return [...bySerial.values()];
};

/**
 * True when every pair of distinct key-sets is comparable by subset. The objects
 * only ever differ by SOME carrying fewer keys than others, never by each
 * holding a key the other lacks. That is one shape with optional fields.
 * A pair that is mutually incomparable (each has a key the other doesn't) is a
 * variant branch. Branch counts stay small in practice, so the pairwise check is
 * plenty.
 */
const isKeySubsetChain = (signatures: readonly ReadonlySet<string>[]): boolean => {
  for (let i = 0; i < signatures.length; i += 1) {
    for (let j = i + 1; j < signatures.length; j += 1) {
      if (!isSubsetOf(signatures[i], signatures[j]) && !isSubsetOf(signatures[j], signatures[i])) return false;
    }
  }
  return true;
};

const isVariantShape = (objects: readonly Record<string, unknown>[]): boolean => {
  const shapes = new Map<string, 'container' | 'primitive'>();
  for (const obj of objects) {
    for (const [key, value] of Object.entries(obj)) {
      if (value === undefined || value === null) continue;
      const seen = shapes.get(key);
      if (seen === undefined) shapes.set(key, shapeOf(value));
      else if (seen !== shapeOf(value)) return true;
    }
  }
  return !isKeySubsetChain(distinctSignatures(objects));
};

const inferStringKind = (strings: readonly string[]): FieldKind => {
  if (strings.every((s) => ID_RE.test(s))) return 'idRef';
  return new Set(strings).size <= ENUM_MAX ? 'enum' : 'string';
};

const inferKind = (values: readonly unknown[]): FieldKind => {
  const sampled = present(values);
  if (!sampled.length) return 'unknown';
  if (sampled.every((v) => typeof v === 'boolean')) return 'boolean';
  if (sampled.every((v) => typeof v === 'number')) return 'number';
  if (sampled.every((v) => Array.isArray(v))) return 'array';
  if (sampled.every((v) => typeof v === 'string')) return inferStringKind(sampled as readonly string[]);
  if (sampled.every(isPlainObject)) {
    return isVariantShape(sampled as readonly Record<string, unknown>[]) ? 'union' : 'object';
  }
  return 'unknown';
};

/** The id prefix every observed value shares, or undefined if they disagree. */
const idTargetKind = (values: readonly unknown[]): string | undefined => {
  const prefixes = new Set(
    present(values)
      .filter((v): v is string => typeof v === 'string')
      .map((v) => v.slice(0, v.lastIndexOf('-'))),
  );
  return prefixes.size === 1 ? [...prefixes][0] : undefined;
};

/** The observed closed set, in first-seen order, for an enum field. */
const enumOptions = (values: readonly unknown[]): readonly string[] => {
  const seen = new Set<string>();
  for (const value of present(values)) if (typeof value === 'string') seen.add(value);
  return [...seen];
};

export { ENUM_MAX, ID_RE, enumOptions, idTargetKind, inferKind, isPlainObject };
