/* @layer bridge-wasm @kind logic */
import type { SimArea } from '@shared/game/simulation';
import { computeBigScreenGroup } from '@domains/widgets/navigation/widget-helpers';
import { locationForScreen } from '../screen-location';

const screenAreaInfo = (screenId: string): SimArea | undefined => {
  const loc = locationForScreen(screenId);
  if (!loc || loc.isIndoors) return undefined;
  const group = computeBigScreenGroup(loc.owScreenIndex);
  if (group.length <= 1) return undefined;
  const head = Math.min(...group);
  return { key: `area-${head}`, label: `area 0x${head.toString(16)}`, size: group.length };
};

export { screenAreaInfo };
