/* @layer shared-game @kind logic */
import type { CustomFamilySetting } from '../capacity-profile.type';

const customSetting = (start: number, max: number, count: number): CustomFamilySetting =>
  ({ mode: 'custom', start, max, count, shape: { curve: 'equal' } });

export { customSetting };
