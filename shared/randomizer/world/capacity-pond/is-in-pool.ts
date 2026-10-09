/* @layer shared-game @kind logic */
import type { FamilySetting } from '../capacity/capacity-profile.type';

const isInPool = (setting: FamilySetting): boolean => setting.mode === 'vanilla-in-pool';

export { isInPool };
