/* @layer bridge-wasm @kind logic */
import type { CrossingOrigin, ScreenCrossing, ScreenCrossings } from '@shared/game/navigation';
import type { ObservedDestKind, ObservedTransition } from '@shared/game/recommendations';

/**
 * Which table a crossing was read off, in the vocabulary the connection probes
 * join on. `doorway` is enumerable like the rest: a doorway object through an
 * outer wall is a real way into the next room, so a dataset that lacks one has
 * a gap worth proposing.
 */
const INDOOR_SOURCE: Partial<Record<CrossingOrigin, string>> = {
  'room-stair': 'stair',
  'room-border': 'walk',
  'room-door': 'exit',
  'exit-table': 'exit',
  'warp-slot': 'travel',
  'room-doorway': 'doorway',
};

/**
 * Outdoors only doors and pits are enumerable. A respawn point leads nowhere,
 * and a hole read from INDOORS is where the player LANDS — an arrival, not a way
 * out of the room — so neither becomes a transition.
 */
const OUTDOOR_SOURCE: Partial<Record<CrossingOrigin, string>> = {
  'ow-entrance': 'entrance',
  'fall-hole': 'hole',
};

/** A screen-boundary scroll proves presence and never absence, so it is graded
 *  apart from the enumerable tables and can back no removal. */
const FLOOD_SOURCE = 'flood';

const sourceFor = (crossing: ScreenCrossing, isIndoors: boolean): string | null => {
  if (crossing.class === 'edge') return crossing.isIntraRoom ? null : FLOOD_SOURCE;
  return (isIndoors ? INDOOR_SOURCE : OUTDOOR_SOURCE)[crossing.origin] ?? null;
};

/** The raw index a probe resolves, in the game's own two vocabularies. */
const destinationOf = (crossing: ScreenCrossing): { kind: ObservedDestKind; index: number } | null => {
  const native = crossing.target.native;
  if (!native) return null;
  return native.kind === 'room'
    ? { kind: 'room', index: native.room }
    : { kind: 'screen', index: native.screen };
};

/**
 * Every crossing of one screen as the recommendation probes read them.
 *
 * PRESENCE only: `available` is deliberately never consulted. A crossing gated
 * behind an item the player does not hold is still a crossing the dataset should
 * carry, and grading it on the loadout would make a finding appear and vanish
 * as the inventory changes.
 */
const transitionsFromCrossings = (crossings: ScreenCrossings, isIndoors: boolean): ObservedTransition[] => {
  const out: ObservedTransition[] = [];
  for (const crossing of [...crossings.entrances, ...crossings.edges]) {
    const source = sourceFor(crossing, isIndoors);
    const destination = destinationOf(crossing);
    if (!source || !destination) continue;
    out.push({ source, ...destination });
  }
  return out;
};

export { transitionsFromCrossings };
