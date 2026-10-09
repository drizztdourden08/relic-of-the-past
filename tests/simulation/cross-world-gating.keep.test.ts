/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { buildAdjacency, reachableFrom, inventoryToReachTokens, requirementsMet } from '@rotp/navigation';
import type { CanPass, ScreenEdge, ReachContext } from '@rotp/navigation';
import { getScreen } from '@rotp/game-data';
import { describeDataset } from '../dataset-guard';

const emptyInventoryContext = (): ReachContext => ({
  tokens: inventoryToReachTokens(new Set<string>()),
  keyAvailable: () => false,
  bigKeys: new Set<string>(),
  events: new Set<string>(),
});

const isDarkWorld = (screenId: string): boolean => getScreen(screenId).world === 'dark';

const LW_10 = 'screen-030';
const WEST_DARK_WORLD = 'screen-260';
const SUPERBUNNY_CAVE_TOP = 'screen-463';

describeDataset('cross-world gating stops an empty inventory crossing into the dark world', () => {
  it('reachableFrom a light-world screen reaches no dark-world screen', () => {
    const adjacency = buildAdjacency();
    const ctx = emptyInventoryContext();
    const canPass: CanPass = (edge: ScreenEdge) => requirementsMet(edge.requirements, ctx);

    const reached = reachableFrom(adjacency, LW_10, canPass);

    expect(reached.size).toBeGreaterThan(20);

    const darkReached = [...reached].filter(isDarkWorld);
    expect(darkReached).toEqual([]);
    expect(reached.has(WEST_DARK_WORLD)).toBe(false);
    expect(reached.has(SUPERBUNNY_CAVE_TOP)).toBe(false);
  });
});
