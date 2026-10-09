/* @layer renderer-widgets @kind logic */
import type { SlotSpec } from '../../ItemsTab.type';

const specBySlot = (specs: SlotSpec[]): Map<number, SlotSpec> => new Map(specs.map((spec) => [spec.slot, spec]));

export { specBySlot };
