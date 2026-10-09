/* @layer renderer-appshell @kind logic */
import type { GridPos } from '@rotp/game-core';
import { linkStartTile } from '@rotp/navigation';
import { screenOriginFor } from '@app/game/flood';
import type { wasmGetViewportInfo } from '@app/game';

const floodStartOf = (
  isIndoors: boolean,
  overworldScreenIndex: number,
  viewport: ReturnType<typeof wasmGetViewportInfo>,
): { floodScreenIndex: number; startPos: GridPos | undefined } => {
  const floodScreenIndex = !isIndoors && viewport
    ? ((((viewport.linkY >> 9) & 7) << 3) | ((viewport.linkX >> 9) & 7))
    : overworldScreenIndex;
  const origin = viewport
    ? screenOriginFor({ isIndoors, linkX: viewport.linkX, linkY: viewport.linkY, screenIndex: floodScreenIndex })
    : null;
  const startPos = viewport && origin
    ? linkStartTile({ linkX: viewport.linkX, linkY: viewport.linkY, screenWorldX: origin.x, screenWorldY: origin.y })
    : undefined;
  return { floodScreenIndex, startPos };
};

export { floodStartOf };
