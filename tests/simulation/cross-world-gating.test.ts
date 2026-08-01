/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { buildAdjacency, reachableFrom, inventoryToReachTokens, requirementsMet } from '../../shared/game/simulation';
import type { CanPass, ScreenEdge, ReachContext } from '../../shared/game/simulation';
import { getScreen } from '../../shared/game/data';

// Empty-inventory reach context: base lift only, no keys / big-keys / events.
const emptyInventoryContext = (): ReachContext => ({
  tokens: inventoryToReachTokens(new Set<string>()),
  keyAvailable: () => false,
  bigKeys: new Set<string>(),
  events: new Set<string>(),
});

const isDarkWorld = (screenId: string): boolean => getScreen(screenId).world === 'dark';

// screen-030 = lw-10, screen-260 = west-dark-world, screen-463 = superbunny-cave-top
// (looked up via scripts/generate-ids/output/id-manifest.json — the old slugs are gone).
const LW_10 = 'screen-030';
const WEST_DARK_WORLD = 'screen-260';
const SUPERBUNNY_CAVE_TOP = 'screen-463';

describe('cross-world gating — empty inventory cannot cross into the dark world', () => {
  it('reachableFrom a light-world screen reaches no dark-world screen', () => {
    const adjacency = buildAdjacency();
    const ctx = emptyInventoryContext();
    const canPass: CanPass = (edge: ScreenEdge) => requirementsMet(edge.requirements, ctx);

    // LW_10 is the exact screen the rain-intro empty-inventory run warped from
    // (lw-10 → west-dark-world) before the moon-pearl fallback gated the edge.
    const reached = reachableFrom(adjacency, LW_10, canPass);

    // Sanity: the light world is still broadly reachable (the gate is targeted,
    // not a blanket block) — otherwise a zero-dark result would be meaningless.
    expect(reached.size).toBeGreaterThan(20);

    const darkReached = [...reached].filter(isDarkWorld);
    expect(darkReached).toEqual([]);
    // The specific edge from the bug report must stay blocked.
    expect(reached.has(WEST_DARK_WORLD)).toBe(false);
    // Untagged crossing (light-world East Death Mountain → dark-world interior,
    // no ctx:cross-world tag) — caught only by the world-aware detection.
    expect(reached.has(SUPERBUNNY_CAVE_TOP)).toBe(false);
  });
});
