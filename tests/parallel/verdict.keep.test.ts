/* @layer test @kind test */
/**
 * The verdict rules decide whether an agent worktree may be handed over or
 * deleted. The case that matters is the refusal: uncommitted or unlanded work
 * must never come out claimable or deletable.
 */
import { describe, it, expect } from 'vitest';
// @ts-expect-error -- plain .mjs tooling module, no type declarations by design
import { VERDICTS, assess, bestToClaim, verdictFor } from '../../scripts/parallel/verdict.mjs';

const NOW = Date.parse('2026-07-25T12:00:00Z');
const inHours = (h: number) => new Date(NOW + h * 3_600_000).toISOString();

const record = (over: Record<string, unknown> = {}) => ({
  name: 'probe', path: '/tmp/probe', branch: 'agent/probe', baseCommit: 'abc',
  lease: null, pr: null, notes: [], ...over,
});

const status = (over: Record<string, unknown> = {}) => ({
  missing: false, dirty: false, ahead: 0, behind: 0, merged: true, ...over,
});

describe('verdictFor', () => {
  it('reports a pristine worktree as ready', () => {
    expect(verdictFor(record(), status(), NOW)).toBe(VERDICTS.READY);
  });

  it('reports a used worktree whose work has landed as spent', () => {
    const used = record({ notes: [{ at: inHours(-2), session: 's', prompt: 'did a thing' }] });
    expect(verdictFor(used, status(), NOW)).toBe(VERDICTS.SPENT);
  });

  it('reports a missing checkout as missing', () => {
    expect(verdictFor(record(), status({ missing: true }), NOW)).toBe(VERDICTS.MISSING);
  });

  it('treats an unexpired lease as leased', () => {
    const held = record({ lease: { holder: 'other', at: inHours(-1), expiresAt: inHours(3) } });
    expect(verdictFor(held, status(), NOW)).toBe(VERDICTS.LEASED);
  });

  it('ignores an expired lease and returns the worktree to the pool', () => {
    const stale = record({ lease: { holder: 'gone', at: inHours(-9), expiresAt: inHours(-5) } });
    expect(verdictFor(stale, status(), NOW)).toBe(VERDICTS.READY);
    expect(assess(stale, status(), NOW).staleLease).toBe(true);
  });

  it('a held lease outranks unmerged work, because someone is in there', () => {
    const held = record({ lease: { holder: 'other', at: inHours(-1), expiresAt: inHours(3) } });
    expect(verdictFor(held, status({ ahead: 3, merged: false }), NOW)).toBe(VERDICTS.LEASED);
  });
});

describe('work is never at risk', () => {
  it('refuses a dirty tree', () => {
    const a = assess(record(), status({ dirty: true }), NOW);
    expect(a.verdict).toBe(VERDICTS.HOLDS_WORK);
    expect(a.claimable).toBe(false);
    expect(a.deletable).toBe(false);
  });

  it('refuses commits that have not landed on the base branch', () => {
    const a = assess(record(), status({ ahead: 2, merged: false }), NOW);
    expect(a.verdict).toBe(VERDICTS.HOLDS_WORK);
    expect(a.deletable).toBe(false);
  });

  it('allows reuse once those same commits are merged', () => {
    const a = assess(record(), status({ ahead: 0, merged: true }), NOW);
    expect(a.deletable).toBe(true);
  });

  it('never offers a leased or work-holding worktree to a claimer', () => {
    const entries = [
      { record: record({ name: 'busy', lease: { holder: 'o', at: inHours(-1), expiresAt: inHours(2) } }), status: status() },
      { record: record({ name: 'wip' }), status: status({ dirty: true }) },
    ].map((e) => ({ ...e, assessment: assess(e.record, e.status, NOW) }));

    expect(bestToClaim(entries)).toBeNull();
  });
});

describe('bestToClaim', () => {
  it('prefers a never-used worktree over one whose notes would be discarded', () => {
    const entries = [
      { record: record({ name: 'spent', notes: [{ at: inHours(-3), session: 's', prompt: 'x' }] }), status: status() },
      { record: record({ name: 'fresh' }), status: status() },
    ].map((e) => ({ ...e, assessment: assess(e.record, e.status, NOW) }));

    expect(bestToClaim(entries).record.name).toBe('fresh');
  });

  it('breaks ties on the least catching-up to do', () => {
    const entries = [
      { record: record({ name: 'far' }), status: status({ behind: 40 }) },
      { record: record({ name: 'near' }), status: status({ behind: 2 }) },
    ].map((e) => ({ ...e, assessment: assess(e.record, e.status, NOW) }));

    expect(bestToClaim(entries).record.name).toBe('near');
  });
});
