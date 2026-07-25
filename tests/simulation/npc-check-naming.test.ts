/* @layer tests @kind test */
/**
 * An NPC marker must carry the CHECK's name, not the sprite's hex — and it must
 * not claim a check for a sprite that only LOOKS like one. Sprite 0x73 spawns in
 * both Link's house intro (scripted, not a check) and the secret passage (the
 * sword check), so the room narrowing is the part that matters here.
 */
import { describe, it, expect } from 'vitest';
import { npcCheckFor } from '../../apps/web/src/lib/game/flood/annotate/npc-checks';

const NONE = new Set<string>();

describe('npc check naming', () => {
  it("names the passage uncle by its check name", () => {
    expect(npcCheckFor(0x73, 0x55, NONE)).toEqual({ name: "Link's Uncle", done: false });
  });

  it('does not claim the check for the same sprite in the house intro room', () => {
    expect(npcCheckFor(0x73, 0x104, NONE)).toBeNull();
  });

  it('reports presence state from the completed set', () => {
    expect(npcCheckFor(0x73, 0x55, new Set(["Link's Uncle"]))?.done).toBe(true);
  });

  it('returns null for a sprite that is in no check table', () => {
    expect(npcCheckFor(0x02, 0x55, NONE)).toBeNull();
  });

  // Most configs carry no `room`, which asserts "this sprite type is always this
  // check wherever it spawns" — the same contract the flag matcher uses. Pinned
  // so a future `room:` addition to one of these is a deliberate change.
  it('matches an unroomed config in any room', () => {
    expect(npcCheckFor(0xff, 0x55, NONE)?.name).toBe('Catfish');
    expect(npcCheckFor(0xff, 0x080, NONE)?.name).toBe('Catfish');
  });
});
