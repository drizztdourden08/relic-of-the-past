/* @layer test @kind test */
import { it, expect } from 'vitest';
import { all, getActorByGameId, replaceRecord } from '@rotp/game-data';
import type { ActorRecord } from '@rotp/game-data';
import type { DetectionContext, ScreenObservations } from '@rotp/navigation';
import { detectorFromStrategy, actorStrategy } from '@rotp/navigation';
import { describeDataset } from '../../dataset-guard';
import { required } from '../../required';

const observations = (overrides: Partial<ScreenObservations> = {}): ScreenObservations => ({
  match: null,
  liveGameId: null,
  isIndoors: true,
  isDarkWorld: false,
  realTransitions: [],
  realAvailable: true,
  unmatchedCrossings: [],
  floodConnections: [],
  existingConnections: [],
  palaceMismatches: [],
  ...overrides,
});

const contextFor = (o: Partial<ScreenObservations>): DetectionContext =>
  ({ origin: 'live', screenId: 'screen-001', observations: observations(o) });

const anActor = (): ActorRecord => {
  const actor = all('actor').find(a => a.gameId.spriteType != null);
  if (!actor) throw new Error('dataset has no actor with a spriteType');
  return actor;
};

const detector = detectorFromStrategy(actorStrategy);

describeDataset('actor strategy (combat probe)', () => {
  it('proposes filling in a combat profile the record has never carried', () => {
    const actor = anActor();
    expect(actor.combat).toBeUndefined();
    const spriteType = actor.gameId.spriteType as number;

    const drafts = detector.detect(contextFor({
      spriteCombat: { [spriteType]: { health: 12, flags4: 0x20, damageByClass: Array(16).fill(1) } },
    })).filter(d => d.targetId === actor.id);

    expect(drafts).toHaveLength(1);
    const draft = required(drafts[0], 'the one draft');
    expect(draft.action).toBe('update');
    expect(draft.detector).toBe('strategy:actor');
    expect(draft.confidence).toBe('certain');
    expect((draft.proposed as ActorRecord).combat?.health).toBe(12);
    expect((draft.proposed as ActorRecord).combat?.damageByClass[3]).toBe(1);
  });

  it('proposes a correction when the record disagrees with the native table', () => {
    const actor = anActor();
    const spriteType = actor.gameId.spriteType as number;
    const patched: ActorRecord = { ...actor, combat: { health: 5, flags4: 0, damageByClass: { 0: 1 } } };
    replaceRecord('actor', patched);

    try {
      const drafts = detector.detect(contextFor({
        spriteCombat: { [spriteType]: { health: 99, flags4: 0, damageByClass: Array(16).fill(1) } },
      })).filter(d => d.targetId === actor.id);
      expect(drafts).toHaveLength(1);
      const draft = required(drafts[0], 'the one draft');
      expect((draft.current as ActorRecord).combat?.health).toBe(5);
      expect((draft.proposed as ActorRecord).combat?.health).toBe(99);
    } finally {
      replaceRecord('actor', actor);
    }
  });

  it('proposes nothing when the stored profile already matches the native table', () => {
    const actor = anActor();
    const spriteType = actor.gameId.spriteType as number;
    const damageByClass = Object.fromEntries(Array(16).fill(0).map((_, i) => [i, i]));
    const patched: ActorRecord = { ...actor, combat: { health: 7, flags4: 3, damageByClass } };
    replaceRecord('actor', patched);

    try {
      const drafts = detector.detect(contextFor({
        spriteCombat: { [spriteType]: { health: 7, flags4: 3, damageByClass: Array(16).fill(0).map((_, i) => i) } },
      })).filter(d => d.targetId === actor.id);
      expect(drafts).toEqual([]);
    } finally {
      replaceRecord('actor', actor);
    }
  });

  it('proposes nothing for a sprite type no ActorRecord catalogues, because that gap belongs to the spawns probe', () => {
    const uncatalogued = Math.max(...all('actor').map(a => a.gameId.spriteType ?? 0)) + 5;
    expect(getActorByGameId({ spriteType: uncatalogued })).toBeUndefined();
    const drafts = detector.detect(contextFor({
      spriteCombat: { [uncatalogued]: { health: 1, flags4: 0, damageByClass: Array(16).fill(0) } },
    })).filter(d => d.action === 'update');
    expect(drafts).toEqual([]);
  });

  it('stays silent when the combat table was never read', () => {
    expect(detector.detect(contextFor({})).filter(d => d.action === 'update')).toEqual([]);
  });
});
