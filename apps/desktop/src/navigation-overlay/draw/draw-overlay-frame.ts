/* @layer renderer-components @kind logic */
import { wasmGetLiveSprites } from '@app/game';
import { buildDrawContext } from './draw-context';
import { drawAnnotations } from './draw-annotations';
import { drawCliffArrows } from './draw-cliff-arrows';
import { drawConnections } from './draw-connections';
import { drawEntrances } from './draw-entrances';
import { drawFallHoleSpawns } from './draw-fall-hole-spawns';
import { drawPathPreview } from './draw-path';
import { drawPitStripes } from './draw-pit-stripes';
import { drawPlayerDebug } from './draw-player-debug';
import { drawReachableDots } from './draw-dots';
import { drawStairArrows } from './draw-stair-arrows';
import type { OverlayFrameInput } from './draw-overlay-frame.type';

const drawOverlayFrame = (input: OverlayFrameInput): void => {
  const { ctx, vp, width, height, result, isIndoors, activeScreenIndex, perLayer, mouseState, overlay } = input;
  const { results, connections, fallHoleSpawns, crossings, annotations, hiddenKinds, setLockedPath } = overlay;

  const dc = buildDrawContext({ ctx, vp, width, height, result, isIndoors });
  const drawResults = results.length > 0 ? results : [result];

  drawReachableDots(dc, drawResults, perLayer);
  drawPathPreview(dc, { mouseState, result, vp, setLockedPath });
  drawCliffArrows(dc, drawResults);
  drawStairArrows(dc, drawResults);
  drawConnections(dc, connections);
  drawEntrances(dc, crossings, isIndoors);
  if (isIndoors) {
    drawFallHoleSpawns(dc, fallHoleSpawns, activeScreenIndex, drawResults);
  }
  drawPitStripes(dc, drawResults);
  if (annotations.length) drawAnnotations(dc, annotations, hiddenKinds);
  drawPlayerDebug(dc, vp, wasmGetLiveSprites());
};

export { drawOverlayFrame };
