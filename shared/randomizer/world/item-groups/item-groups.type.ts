/* @layer shared-game @kind types */
import type { ITEM } from '../item-ids.data';

type MedallionId = typeof ITEM.bombos | typeof ITEM.ether | typeof ITEM.quake;

export type { MedallionId };
