/* @layer renderer-components @kind logic */
import { gamepadDisplayMapping } from './gamepad-display-mapping';
import type { ButtonDisplayMappingParams } from './controls-settings.type';

const buttonDisplayMapping = ({ button, mapping, multiController, devices }: ButtonDisplayMappingParams) => {
  if (!mapping) return { snesButton: button, binding: { type: 'none' as const }, icon: null, deviceIconUrl: null };
  if (mapping.binding.type === 'none' || mapping.binding.type === 'keyboard') {
    return { ...mapping, icon: null, deviceIconUrl: null };
  }
  return gamepadDisplayMapping({ mapping, multiController, devices });
};

export { buttonDisplayMapping };
