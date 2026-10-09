/* @layer bridge-wasm @kind logic */
import type { ScreenCrossing, ScreenCrossings } from '../pathfinding/crossing.type';
import type { ObservedDestKind, ObservedTransition } from '../recommendations/detection-types/observation.type';
import { FLOOD_SOURCE, INDOOR_SOURCE, OUTDOOR_SOURCE } from './crossing-transitions.constants';

const sourceFor = (crossing: ScreenCrossing, isIndoors: boolean): string | null => {
  if (crossing.class === 'edge') return crossing.isIntraRoom ? null : FLOOD_SOURCE;
  return (isIndoors ? INDOOR_SOURCE : OUTDOOR_SOURCE)[crossing.origin] ?? null;
};

const destinationOf = (crossing: ScreenCrossing): { kind: ObservedDestKind; index: number } | null => {
  const native = crossing.target.native;
  if (!native) return null;
  return native.kind === 'room'
    ? { kind: 'room', index: native.room }
    : { kind: 'screen', index: native.screen };
};

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
