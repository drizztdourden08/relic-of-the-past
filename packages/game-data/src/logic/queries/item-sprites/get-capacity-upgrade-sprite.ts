/* @layer shared-game @kind logic */
import type { CapacityFamilyId } from '../../../data';
import { spriteUrlOf } from './sprite-url-of';

const getCapacityUpgradeSprite = (family: CapacityFamilyId): string =>
  spriteUrlOf(`upgrade-${family}`);

export { getCapacityUpgradeSprite };
