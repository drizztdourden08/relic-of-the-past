/* @layer shared-game @kind constants */
import type { SwordTier, TitleProgress } from '../title-frame.type';

const SWORD_OFFSET = 0x359;
const PROGRESS_OFFSET = 0x3c5;
const SECOND_HALF_AT = 3;
const MAX_SWORD = 4;

const TIER_OF_SWORD: readonly SwordTier[] = ['fighter', 'fighter', 'master', 'tempered', 'golden'];

const DEFAULT_PROGRESS: TitleProgress = { tier: 'fighter', world: 'light', fromSlot: null };

export { DEFAULT_PROGRESS, MAX_SWORD, PROGRESS_OFFSET, SECOND_HALF_AT, SWORD_OFFSET, TIER_OF_SWORD };
