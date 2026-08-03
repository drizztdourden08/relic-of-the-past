/* @layer test @kind test */
/**
 * The actor-spawns detector: a live sprite spawn with no ActorRecord covering
 * its sprite type at all.
 */
import { describe, it, expect } from 'vitest';
import { all } from '@shared/game/data';
import type { DetectionContext, ScreenObservations } from '@shared/game/recommendations';
import { actorSpawnsDetector } from '@shared/game/recommendations/detectors/actor-spawns';

/** A sprite type no ActorRecord in the real dataset uses. */
const UNCATALOGUED = Math.max(...all('actor').map(a => a.gameId.spriteType ?? 0)) + 5;

const observations = (overrides: Partial<ScreenObservations> = {}): ScreenObservations => ({
  match: null,
  liveGameId: null,
  isIndoors: true,
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

describe('actor-spawns detector', () => {
  it('proposes a new ActorRecord for a spawn with no catalogued sprite type', () => {
    const drafts = actorSpawnsDetector.detect(contextFor({
      liveSprites: [{ spriteType: UNCATALOGUED, col: 4, row: 4, floor: 0 }],
    }));

    expect(drafts).toHaveLength(1);
    const [draft] = drafts;
    expect(draft.action).toBe('create');
    expect(draft.targetId).toBeNull();
    expect(draft.confidence).toBe('certain');
    expect(draft.key).toBe(`spriteType:${UNCATALOGUED}`);
    expect(draft.proposed).not.toHaveProperty('id');
    expect((draft.proposed as { gameId: { spriteType: number } }).gameId.spriteType).toBe(UNCATALOGUED);
    // No native combat row was supplied, so 'object' is the classification —
    // never a guessed 'enemy'/'npc'/'boss'.
    expect((draft.proposed as { kind: string }).kind).toBe('object');
  });

  it('classifies as enemy and attaches the combat profile when a native combat row backs it', () => {
    const drafts = actorSpawnsDetector.detect(contextFor({
      liveSprites: [{ spriteType: UNCATALOGUED, col: 4, row: 4, floor: 0 }],
      spriteCombat: { [UNCATALOGUED]: { health: 8, flags4: 0x40, damageByClass: Array(16).fill(2) } },
    }));

    expect(drafts).toHaveLength(1);
    const proposed = drafts[0].proposed as { kind: string; combat?: { health: number } };
    expect(proposed.kind).toBe('enemy');
    expect(proposed.combat?.health).toBe(8);
  });

  it('collapses repeat spawns of the same uncatalogued type into one finding', () => {
    const drafts = actorSpawnsDetector.detect(contextFor({
      liveSprites: [
        { spriteType: UNCATALOGUED, col: 1, row: 1, floor: 0 },
        { spriteType: UNCATALOGUED, col: 9, row: 9, floor: 0 },
      ],
    }));
    expect(drafts).toHaveLength(1);
  });

  it('proposes nothing for a spawn whose sprite type is already catalogued', () => {
    const known = all('actor').find(a => a.gameId.spriteType != null);
    if (!known) throw new Error('dataset has no actor with a spriteType');
    const drafts = actorSpawnsDetector.detect(contextFor({
      liveSprites: [{ spriteType: known.gameId.spriteType as number, col: 0, row: 0, floor: 0 }],
    }));
    expect(drafts).toEqual([]);
  });

  it('stays silent when live sprites were never read', () => {
    expect(actorSpawnsDetector.detect(contextFor({}))).toEqual([]);
  });
});
