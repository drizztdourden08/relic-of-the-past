/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import type { CheckId } from '../../shared/game/data';
import { npcCheckFor } from '../../apps/web/src/lib/game/flood/annotate/npc-checks';
import { describeDataset } from '../dataset-guard';

const NONE = new Set<CheckId>();
const PASSAGE_SPRITE = 0x73;
const PASSAGE_ROOM = 0x55;
const PASSAGE_CHECK: CheckId = 'check-017';

describeDataset('npc check naming', () => {
  it('names the passage sprite by its check id and name', () => {
    expect(npcCheckFor(PASSAGE_SPRITE, PASSAGE_ROOM, NONE)).toEqual({
      checkId: PASSAGE_CHECK, name: "Link's Uncle", done: false,
    });
  });

  it('does not claim the check for the same sprite in the scripted opening room', () => {
    expect(npcCheckFor(PASSAGE_SPRITE, 0x104, NONE)).toBeNull();
  });

  it('reports presence state from the completed set, keyed by id', () => {
    expect(npcCheckFor(PASSAGE_SPRITE, PASSAGE_ROOM, new Set([PASSAGE_CHECK]))?.done).toBe(true);
  });

  it('is not fooled by the check display name in the completed set', () => {
    expect(npcCheckFor(PASSAGE_SPRITE, PASSAGE_ROOM, new Set(['check-999'] as CheckId[]))?.done).toBe(false);
  });

  it('returns null for a sprite that is in no check table', () => {
    expect(npcCheckFor(0x02, PASSAGE_ROOM, NONE)).toBeNull();
  });

  it('matches an unroomed config in any room', () => {
    expect(npcCheckFor(0xff, 0x55, NONE)?.checkId).toBe('check-077');
    expect(npcCheckFor(0xff, 0x080, NONE)?.checkId).toBe('check-077');
  });
});
