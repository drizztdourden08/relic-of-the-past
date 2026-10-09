/* @layer renderer-appshell @kind logic */
import type { SimRunConfig } from '@rotp/navigation';
import { linkStartTile } from '@rotp/navigation';
import { wasmGetViewportInfo } from '@app/game';
import { floodOverworldScreen } from '@app/game/simulator';
import { overworldOrigin } from '@app/game/flood';

const simFloodScreen = (config: SimRunConfig, floodScreen: number) => {
  const vp = wasmGetViewportInfo();
  const liveScreen = vp ? ((((vp.linkY >> 9) & 7) << 3) | ((vp.linkX >> 9) & 7)) : -1;
  const startPos = config.probeTile ?? (vp && liveScreen === floodScreen
    ? linkStartTile({
      linkX: vp.linkX, linkY: vp.linkY,
      screenWorldX: overworldOrigin(floodScreen).x,
      screenWorldY: overworldOrigin(floodScreen).y,
    })
    : undefined);
  const items = ['lift.1', ...(config.probeItems ?? [])] as Parameters<typeof floodOverworldScreen>[2];
  const flood = floodOverworldScreen(floodScreen, startPos, items);
  console.log(`[SimRun] flood seed=${JSON.stringify(startPos)} liveScreen=0x${liveScreen.toString(16)}`);
  console.log(`[SimRun] flood screen 0x${floodScreen.toString(16)}: ${JSON.stringify(flood && { reachable: flood.reachableCount, total: flood.totalTiles, entrances: flood.entranceCount, edges: flood.edgeCount, ledges: flood.ledgeCount })}`);
  return { floodScreen, items, flood };
};

export { simFloodScreen };
