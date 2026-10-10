/* @layer renderer-widgets @kind logic */
import type { TierOption } from '../ItemsTab.type';

const isRemoval = (option: TierOption): boolean => option.value === 0 && option.sprite === null;

export { isRemoval };
