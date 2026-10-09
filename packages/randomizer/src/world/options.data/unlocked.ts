/* @layer shared-game @kind logic */
import type { OptionSeed } from '../options.type';

const unlocked = (seed: OptionSeed): OptionSeed => ({ ...seed, locked: false });

export { unlocked };
