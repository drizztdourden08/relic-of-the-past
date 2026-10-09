/* @layer shared-game @kind constants */
import { POND_INSTANCES } from '../pond/pond-instances';
import { POND_SHARE_KEY } from '../pond/pond-share';
import { askToggleSeed } from './ask-toggle-seed';
import { pondSeedsOf } from './pond-seeds-of';
import type { OptionSeed } from '../options.type';

const POND_SHARE_SEED: OptionSeed = askToggleSeed(POND_SHARE_KEY, 'Ponds share one setting', false);

const POND_OPTION_SEEDS: readonly OptionSeed[] = [POND_SHARE_SEED, ...POND_INSTANCES.flatMap(pondSeedsOf)];

export { POND_OPTION_SEEDS };
