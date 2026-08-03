/* @layer test @kind test */
/**
 * The add detector against the mechanism it wraps, on the real dataset.
 *
 * Beyond agreeing on WHAT is missing, this pins the two things the wrapper adds:
 * the proposal is the record the audit already built (not its rendered text),
 * and confidence follows the evidence — a native crossing is `certain`, a
 * flood-derived scroll edge is not.
 */
import { describe, it, expect } from 'vitest';
import { all, find, findOne } from '@shared/game/data';
import type { ScreenId, ScreenRecord } from '@shared/game/data';
import type { DetectionContext, ObservedCrossing, ScreenObservations } from '@shared/game/recommendations';
import { buildAddFindings } from '@app/ui/domains/widgets/navigation/connection-audit-core';
import { connectionAddDetector } from '@app/ui/domains/widgets/navigation/recommendations/detectors/connection-add';

const connected = (a: ScreenId, b: ScreenId): boolean =>
  findOne('connection', c => (c.fromScreenId === a && c.toScreenId === b) || (c.fromScreenId === b && c.toScreenId === a)) != null;

/**
 * Two real screens with no edge between them — an entrance the dataset does not
 * map is exactly the finding the add path exists for.
 */
const unmappedPair = (): { from: ScreenRecord; to: ScreenRecord } => {
  const overworld = all('screen').filter(s => s.kind === 'overworld');
  const interiors = all('screen').filter(s => s.kind === 'interior' && s.gameId.roomIndex != null);
  for (const from of overworld) {
    const to = interiors.find(i => i.world === from.world && !connected(from.id, i.id));
    if (to) return { from, to };
  }
  throw new Error('dataset has no unmapped overworld/interior pair');
};

const contextFor = (screenId: ScreenId, crossings: ObservedCrossing[]): DetectionContext => {
  const observations: ScreenObservations = {
    match: null,
    liveGameId: null,
    isIndoors: false,
    realTransitions: [],
    realAvailable: true,
    unmatchedCrossings: crossings,
    floodConnections: [],
    existingConnections: [],
    palaceMismatches: [],
  };
  return { origin: 'live', screenId, observations };
};

const crossingTo = (to: ScreenRecord, type: ObservedCrossing['type']): ObservedCrossing => ({
  type,
  targetRoomOrScreen: to.gameId.roomIndex ?? to.gameId.overworldIndex ?? 0,
  toScreenId: to.id,
  isExit: false,
  label: to.id,
});

describe('connection-add detector parity with the connection audit', () => {
  const { from, to } = unmappedPair();
  const crossings = [crossingTo(to, 'entrance')];
  const context = contextFor(from.id, crossings);

  const original = buildAddFindings(from.id, crossings, []);
  const drafts = connectionAddDetector.detect(context);

  it('finds something to compare — the fixture is not vacuously green', () => {
    expect(original.length).toBeGreaterThan(0);
  });

  it('proposes exactly the connections the original mechanism proposes', () => {
    expect(drafts.map(d => d.screenId)).toEqual(original.map(f => f.fromScreenId));
    expect(drafts.map(d => d.key)).toEqual(original.map(f => `to:${f.toScreenId}`));
  });

  it('carries the audit-built record itself, not a re-derivation of it', () => {
    expect(drafts.map(d => d.proposed)).toEqual(original.map(f => f.record));
    expect(drafts.map(d => d.reason)).toEqual(original.map(f => f.reason));
  });

  it('mints no id for a create — the allocator does that', () => {
    for (const d of drafts) {
      expect(d.action).toBe('create');
      expect(d.targetId).toBeNull();
      expect(d.current).toBeNull();
      expect(d.proposed).not.toHaveProperty('id');
    }
  });

  it('grades a native crossing certain', () => {
    expect(drafts.every(d => d.confidence === 'certain')).toBe(true);
    expect(drafts[0].evidence[0].source).toBe('native:entrance');
  });

  it('grades a flood-derived scroll edge only likely', () => {
    const scroll = connectionAddDetector.detect(contextFor(from.id, [crossingTo(to, 'edge')]));
    expect(scroll.length).toBeGreaterThan(0);
    expect(scroll.every(d => d.confidence === 'likely')).toBe(true);
    expect(scroll[0].evidence[0].source).toBe('flood:crossing');
  });

  it('proposes nothing for a crossing whose destination has no record', () => {
    const unresolved: ObservedCrossing = { ...crossingTo(to, 'entrance'), toScreenId: null };
    expect(buildAddFindings(from.id, [unresolved], [])).toEqual([]);
    expect(connectionAddDetector.detect(contextFor(from.id, [unresolved]))).toEqual([]);
  });

  it('stays silent when the room tables were never read', () => {
    expect(connectionAddDetector.detect({ ...context, observations: { ...context.observations, realAvailable: false } })).toEqual([]);
  });

  it('dedupes two detections of the same destination exactly as the audit does', () => {
    const twice = [crossingTo(to, 'entrance'), crossingTo(to, 'entrance')];
    expect(connectionAddDetector.detect(contextFor(from.id, twice))).toHaveLength(
      buildAddFindings(from.id, twice, []).length,
    );
  });
});

describe('the connection editor wizard is a strict subset of the add path', () => {
  it('proposes a destination for every detection the wizard would offer', () => {
    const { from, to } = unmappedPair();
    const crossings = [crossingTo(to, 'entrance'), crossingTo(to, 'stair')];
    // The wizard's suggestion list is one row per unmatched detection whose
    // destination resolved; the add path covers every one of those and, unlike
    // the wizard, refuses the ones that would write an unresolved endpoint.
    const wizardWould = crossings.filter(c => c.toScreenId !== null).map(c => c.toScreenId);
    const covered = new Set(buildAddFindings(from.id, crossings, []).map(f => f.toScreenId));
    for (const id of new Set(wizardWould)) expect(covered.has(id as ScreenId)).toBe(true);
    expect(find('connection', c => c.fromScreenId === from.id && c.toScreenId === to.id)).toHaveLength(0);
  });
});
