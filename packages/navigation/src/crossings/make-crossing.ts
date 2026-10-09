/* @layer bridge-wasm @kind logic */
import type { ScreenCrossing } from '@rotp/game-core';
import { arrivalLabel } from '../simulation';
import { distanceAt, decodeScore } from '../simulator/exit-order';
import { crossingAvailability } from './availability';
import type { CrossingPass, CrossingParts } from './crossings.type';

const stepsFor = (pass: CrossingPass, tile: ScreenCrossing['tile']): number | undefined =>
  pass.dist ? decodeScore(distanceAt(pass.dist, tile)).steps : undefined;

const makeCrossing = (pass: CrossingPass, parts: CrossingParts): ScreenCrossing => {
  const { id, tile, target, edgeSig, requirements = [] } = parts;
  const steps = stepsFor(pass, tile);
  const arrival = arrivalLabel(edgeSig, tile);
  const reachable = parts.screenWide ? undefined : pass.reachable;
  const { available } = crossingAvailability({ tile, requirements, reachable, items: pass.items });
  return {
    id,
    class: parts.class,
    kind: parts.kind,
    origin: parts.origin,
    tile,
    placed: parts.screenWide !== true,
    ...(parts.side ? { side: parts.side } : {}),
    ...(parts.layer !== undefined ? { layer: parts.layer } : {}),
    ...(parts.span ? { span: parts.span } : {}),
    ...(parts.layerToggle ? { layerToggle: true } : {}),
    target: target.target,
    label: target.label,
    available,
    requirements,
    ...(steps !== undefined ? { steps } : {}),
    ...(arrival ? { arrival } : {}),
    ...(parts.isIntraRoom ? { isIntraRoom: true } : {}),
  };
};

export { makeCrossing };
