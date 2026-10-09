/* @layer shared-game @kind logic */
import type { HeroRng } from './hero-idle.type';

const pickInt = (rng: HeroRng, min: number, max: number): number =>
  min + Math.floor(rng() * (max - min + 1));

export { pickInt };
