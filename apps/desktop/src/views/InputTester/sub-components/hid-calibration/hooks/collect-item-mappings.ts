/* @layer renderer-components @kind logic */
import type { HidAxisMapping, HidButtonMapping, InputItem } from '../hid-calibration.type';

const collectItemMappings = (items: readonly InputItem[]): { buttons: Record<string, HidButtonMapping>; axes: Record<string, HidAxisMapping> } => {
  const buttons: Record<string, HidButtonMapping> = {};
  const axes: Record<string, HidAxisMapping> = {};
  for (const item of items) {
    if (item.axisMapping) axes[item.id] = item.axisMapping;
    else if (item.mapping) buttons[item.id] = item.mapping;
  }
  return { buttons, axes };
};

export { collectItemMappings };
