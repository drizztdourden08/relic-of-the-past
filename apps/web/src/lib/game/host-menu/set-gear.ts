/* @layer bridge-wasm @kind logic */
import type { GearLadderKind } from '@shared/game/logic/pause';
import { wasmHostSetGear } from '../bridge/host-menu';
import { GEAR_KIND_ARG } from './host-menu.constants';

const setGear = (kind: GearLadderKind, tier: number): void =>
  wasmHostSetGear(GEAR_KIND_ARG[kind], tier);

export { setGear };
