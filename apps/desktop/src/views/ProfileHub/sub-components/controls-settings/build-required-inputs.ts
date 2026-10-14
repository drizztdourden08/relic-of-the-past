/* @layer renderer-components @kind logic */
import { allowedDevices } from '@rotp/input-mapping';
import { gamepadRequiredInputs } from './gamepad-required-inputs';
import { keyboardRequiredInput } from './keyboard-required-input';
import type { UseDisplayMappingsArgs, RequiredInput } from './controls-settings.type';

const buildRequiredInputs = ({ activeProfile, devices }: UseDisplayMappingsArgs): RequiredInput[] => {
  if (!activeProfile) return [];
  const { keyboard: hasKeyboard, gamepadKeys } = allowedDevices(activeProfile);
  const hasGamepad = activeProfile.mappings.some(m => m.binding.type !== 'keyboard');
  return [
    ...(hasKeyboard ? [keyboardRequiredInput(devices)] : []),
    ...(hasGamepad ? gamepadRequiredInputs(activeProfile, gamepadKeys, devices) : []),
  ];
};

export { buildRequiredInputs };
