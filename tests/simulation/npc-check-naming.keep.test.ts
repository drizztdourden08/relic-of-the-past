/* @layer tests @kind test */
/**
 * An NPC marker must carry the CHECK it is — its id, plus the name to draw — and
 * it must not claim a check for a sprite that only LOOKS like one. Sprite 0x73
 * spawns both in the scripted opening room (not a check) and in the passage where
 * the sword is handed over (the check), so the room narrowing is what matters
 * here. Completion is asked by id: names are not unique, so a name-keyed set
 * cannot answer this question reliably.
 */
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

  // Most configs carry no `room`, which asserts "this sprite type is always this
  // check wherever it spawns" — the same contract the flag matcher uses. Pinned
  // so a future `room:` addition to one of these is a deliberate change.
  it('matches an unroomed config in any room', () => {
    expect(npcCheckFor(0xff, 0x55, NONE)?.checkId).toBe('check-077');
    expect(npcCheckFor(0xff, 0x080, NONE)?.checkId).toBe('check-077');
  });
});
