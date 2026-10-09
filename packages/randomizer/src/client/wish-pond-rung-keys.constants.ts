/* @layer bridge-wasm @kind constants */
import { pondInstanceOf } from '../world/pond/pond-instances';
import type { WishPondWater } from './wish-pond-rung-keys.type';

const WISH_POND_WATERS: readonly WishPondWater[] = [
  { instance: pondInstanceOf('wishing'), pond: 0 },
  { instance: pondInstanceOf('cursed'), pond: 1 },
];

export { WISH_POND_WATERS };
