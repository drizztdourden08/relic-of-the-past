/* @layer shared-game @kind logic */
/**
 * An amount of rupees as the gems that depict it. Plain greedy over the six
 * denominations, largest first — the fewest gems that add up exactly, and the
 * reading a player does at a glance: 300 is one gold; 427 is one gold, one
 * silver, one red, one blue and two greens.
 *
 * The gems then leave in VOLLEYS. The game decodes one sprite sheet at a time
 * for a group of flying receipts, so gems that need different sheets — or,
 * with coloured rupees on, different recolours of the shared gem sheet —
 * cannot be in the air together. Consecutive gems with the same decode key
 * travel together, at most one pond slot-full each, so the same amount always
 * decomposes and always leaves the same way whichever setting is on.
 *
 * The mirror of this is GameHook_PondTossRupees (core/game-hooks/
 * pond_toss_draw.c); the numbers here are what its unit test pins.
 */
import { POND_GEM_SLOTS, RUPEE_DENOMINATIONS } from './rupee-gems.data';
import type { RupeeDenomination } from './rupee-gems.data';

/** The gems that add up to |amount|, largest first. A negative or zero amount shows nothing. */
const decomposeRupees = (amount: number): RupeeDenomination[] => {
  const gems: RupeeDenomination[] = [];
  let left = Math.max(0, Math.floor(amount));
  for (const denomination of RUPEE_DENOMINATIONS) {
    while (left >= denomination.value) {
      gems.push(denomination);
      left -= denomination.value;
    }
  }
  return gems;
};

/** The gems grouped as they can actually fly: one decode key per volley, at most a slot-full. */
const rupeeVolleysOf = (amount: number): RupeeDenomination[][] => {
  const volleys: RupeeDenomination[][] = [];
  for (const gem of decomposeRupees(amount)) {
    const last = volleys[volleys.length - 1];
    if (last !== undefined && last.length < POND_GEM_SLOTS && last[0].decodeKey === gem.decodeKey) last.push(gem);
    else volleys.push([gem]);
  }
  return volleys;
};

/** "1 gold, 1 silver, 1 red, 1 blue, 2 green" — the readout the panel and the logs show. */
const describeRupees = (amount: number): string => {
  const counts = new Map<string, number>();
  for (const gem of decomposeRupees(amount)) counts.set(gem.colour, (counts.get(gem.colour) ?? 0) + 1);
  return [...counts].map(([colour, count]) => `${count} ${colour}`).join(', ');
};

export { decomposeRupees, describeRupees, rupeeVolleysOf };
