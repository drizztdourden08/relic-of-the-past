/* @layer store-site @kind logic */
/**
 * The version numbers the store takes: three whole numbers, `1.4.0`. A new version must be
 * higher than every version the item already has; store-api checks the same rule.
 */
const SEMVER = /^(0|[1-9]\d{0,5})\.(0|[1-9]\d{0,5})\.(0|[1-9]\d{0,5})$/;

const parseSemver = (value: string): [number, number, number] | null => {
  const match = SEMVER.exec(value.trim());
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null;
};

const compareSemver = (a: string, b: string): number => {
  const left = parseSemver(a) ?? [0, 0, 0];
  const right = parseSemver(b) ?? [0, 0, 0];
  for (let i = 0; i < 3; i += 1) {
    if (left[i] !== right[i]) return left[i] - right[i];
  }
  return 0;
};

/** Null when the value is fine, else what is wrong with it. */
const semverProblem = (value: string, existing: readonly string[]): string | null => {
  if (!parseSemver(value)) return 'Three numbers, like 1.0.0.';
  const highest = existing.reduce<string | null>((top, v) => (top === null || compareSemver(v, top) > 0 ? v : top), null);
  if (highest && compareSemver(value, highest) <= 0) return `Must be higher than ${highest}.`;
  return null;
};

export { parseSemver, compareSemver, semverProblem };
