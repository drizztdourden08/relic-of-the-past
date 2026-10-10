/* @layer shared-game @kind logic */
import type { PlannedFamilySetting } from '../capacity-profile.type';

const customSetting = (start: number, max: number, count: number): PlannedFamilySetting =>
  ({ mode: 'custom', start, max, count, shape: { curve: 'equal' } });

export { customSetting };
