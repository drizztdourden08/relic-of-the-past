/* @layer renderer-widgets @kind logic */
import { wasmGetDungeonMapPosition } from '../../../game';
import type { EffectiveLayout } from '../nav-flood.type';

const effectiveLayout = (): EffectiveLayout | undefined => {
  const mapPos = wasmGetDungeonMapPosition();
  return mapPos?.found ? { width: mapPos.effectiveWidth, height: mapPos.effectiveHeight } : undefined;
};

export { effectiveLayout };
