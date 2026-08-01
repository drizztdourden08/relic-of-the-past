/**
 * @layer tooling-scripts
 * @kind logic
 *
 * The gate. Every check runs BEFORE a single byte reaches disk; one failure and
 * the run writes nothing. Ids were frozen by an earlier one-time assignment, so
 * id-set equality between the seeds and the emitted hierarchy is the load-bearing
 * assertion here — a lost or re-derived id is silent corruption.
 */
import type { Loose } from './seed-types';

const failures: string[] = [];

const fail = (message: string): void => { failures.push(message); };

const expectCount = (label: string, actual: number, expected: number): void => {
  if (actual !== expected) fail(`${label}: expected ${expected} records, got ${actual}`);
};

const sorted = (ids: Iterable<string>): string[] => [...ids].sort();

/** Set equality plus a duplicate check on the emitted side. */
const expectIdSets = (label: string, seedIds: readonly string[], emittedIds: readonly string[]): void => {
  const seed = new Set(seedIds);
  const emitted = new Set(emittedIds);
  if (emitted.size !== emittedIds.length) {
    const seen = new Set<string>();
    const dupes = emittedIds.filter(id => (seen.has(id) ? true : (seen.add(id), false)));
    fail(`${label}: duplicate emitted id(s): ${sorted(new Set(dupes)).join(', ')}`);
  }
  const missing = sorted(seedIds).filter(id => !emitted.has(id));
  const extra = sorted(emittedIds).filter(id => !seed.has(id));
  if (missing.length) fail(`${label}: ${missing.length} seed id(s) missing from the emitted files: ${missing.slice(0, 10).join(', ')}`);
  if (extra.length) fail(`${label}: ${extra.length} emitted id(s) absent from the seeds: ${extra.slice(0, 10).join(', ')}`);
};

const expectSymmetry = (pairs: Map<string, string>): void => {
  for (const [a, b] of pairs) {
    if (a === b) fail(`counterpart: ${a} points at itself`);
    if (pairs.get(b) !== a) fail(`counterpart: ${a} → ${b} but ${b} → ${String(pairs.get(b))}`);
  }
};

/**
 * No feature is smaller than one 16px collision block, so an area placement is
 * always at least 2x2 base tiles.
 */
const expectPlacements = (records: readonly Loose[]): void => {
  for (const record of records) {
    const placement = record.placement as { at?: string; rect?: { w?: number; h?: number } } | undefined;
    if (!placement || placement.at !== 'area') continue;
    const { w, h } = placement.rect ?? {};
    if (!(typeof w === 'number' && typeof h === 'number' && w >= 2 && h >= 2)) {
      fail(`placement: ${String(record.id)} has an area rect smaller than one collision block (${String(w)}x${String(h)})`);
    }
  }
};

const expectRequired = (label: string, records: readonly Loose[], fields: readonly string[]): void => {
  for (const record of records) {
    const absent = fields.filter(f => record[f] === undefined);
    if (absent.length) fail(`${label}: ${String(record.id)} is missing required field(s): ${absent.join(', ')}`);
  }
};

const expectSameFiles = (label: string, actual: Iterable<string>, expected: readonly string[]): void => {
  const got = sorted(new Set(actual));
  const want = sorted(new Set(expected));
  if (got.join('|') !== want.join('|')) {
    const missing = want.filter(f => !got.includes(f));
    const extra = got.filter(f => !want.includes(f));
    fail(`${label}: unexpected file set — missing [${missing.join(', ')}], extra [${extra.join(', ')}]`);
  }
};

const expectResolves = (label: string, refs: readonly (string | undefined)[], universe: ReadonlySet<string>): void => {
  const dangling = sorted(new Set(refs.filter((r): r is string => r !== undefined && !universe.has(r))));
  if (dangling.length) fail(`${label}: ${dangling.length} reference(s) resolve to nothing: ${dangling.slice(0, 10).join(', ')}`);
};

const report = (): readonly string[] => failures;

export {
  expectCount, expectIdSets, expectPlacements, expectRequired, expectResolves,
  expectSameFiles, expectSymmetry, fail, report,
};
