/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import { SNES_BUTTONS } from '@rotp/game-data';
import { allowedDevices } from '@rotp/input-mapping';
import { buildRequiredInputs } from './build-required-inputs';
import { buttonDisplayMapping } from './button-display-mapping';
import type { UseDisplayMappingsArgs } from './controls-settings.type';

const useDisplayMappings = ({ activeProfile, devices }: UseDisplayMappingsArgs) => {
  const requiredInputs = useMemo(() => buildRequiredInputs({ activeProfile, devices }), [activeProfile, devices]);

  const multiController = useMemo(() => allowedDevices(activeProfile).gamepadKeys.size > 1, [activeProfile]);

  const displayMappings = useMemo(() => SNES_BUTTONS.map(button => {
    const mapping = activeProfile?.mappings.find(m => m.snesButton === button);
    return buttonDisplayMapping({ button, mapping, multiController, devices });
  }), [activeProfile, devices, multiController]);

  return { requiredInputs, displayMappings };
};

export { useDisplayMappings };
