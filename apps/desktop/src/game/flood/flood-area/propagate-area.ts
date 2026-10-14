/* @layer bridge-wasm @kind logic */
import type { GridPos } from '@rotp/game-core';
import type { SimLocation, AreaFloodRequest, ScreenFloodResult } from '@rotp/navigation';
import { computeBigScreenGroup } from '@app/nav-widget/widget-helpers';
import { createSeedLedger, crossingLanding, roomLandingTile, MAX_INDOOR_ROOMS, MAX_ITERATIONS, floodOneScreen, entrancesForScreen } from '@rotp/navigation';
import { seedOptions } from './seed-options';
import { stairDestination } from './stair-destination';

const propagateArea = (req: AreaFloodRequest): ScreenFloodResult[] => {
  const { isIndoors, primaryScreenIndex, startPos, ...shared } = req;
  const allowed = new Set(isIndoors ? [primaryScreenIndex] : computeBigScreenGroup(primaryScreenIndex));
  const locationOf = (screenIndex: number): SimLocation => isIndoors
    ? { isIndoors: true, roomId: screenIndex, owScreenIndex: 0 }
    : { isIndoors: false, roomId: 0, owScreenIndex: screenIndex };
  const entrancesFor = entrancesForScreen(isIndoors, primaryScreenIndex, shared.entrances);

  const analyzed = new Map<number, ScreenFloodResult>();
  const ledger = createSeedLedger();
  let dirty = new Set<number>([primaryScreenIndex]);

  const offerSeed = (screenIndex: number, tile: GridPos): void => {
    if (!allowed.has(screenIndex)) return;
    if (!ledger.add(screenIndex, tile)) return;
    const prev = analyzed.get(screenIndex);
    if (prev && (prev.result.reachable[tile.row]?.[tile.col] ?? 0) > 0) return;
    dirty.add(screenIndex);
  };

  const offerStairLanding = (screenIndex: number, entranceIdx: number | undefined): void => {
    const destRoom = stairDestination({ isIndoors, entranceIdx, screenIndex, entrancesFor });
    if (destRoom === null) return;
    if (!allowed.has(destRoom) && allowed.size < MAX_INDOOR_ROOMS) allowed.add(destRoom);
    const landing = roomLandingTile(destRoom, screenIndex);
    if (landing) offerSeed(destRoom, landing);
  };

  const offerCrossings = (screenIndex: number, entry: ScreenFloodResult): void => {
    for (const t of entry.result.transitions) {
      if (t.edge === 'entrance') {
        offerStairLanding(screenIndex, t.entranceIdx);
        continue;
      }
      const landing = crossingLanding(screenIndex, t.edge, t);
      if (landing) offerSeed(landing.screenIndex, landing.tile);
    }
  };

  for (let pass = 0; pass < MAX_ITERATIONS && dirty.size > 0; pass++) {
    const batch = [...dirty];
    dirty = new Set();
    for (const screenIndex of batch) {
      const isPrimary = screenIndex === primaryScreenIndex;
      const entry = floodOneScreen(locationOf(screenIndex), {
        ...shared,
        entrances: entrancesFor(screenIndex),
        ...seedOptions(ledger.list(screenIndex), isPrimary, startPos),
        atPlayer: isPrimary ? shared.atPlayer : false,
      });
      if (!entry) continue;
      analyzed.set(screenIndex, entry);
      offerCrossings(screenIndex, entry);
    }
  }
  return [...analyzed.values()];
};

export { propagateArea };
