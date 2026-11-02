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

  const displayMappings = useMemo(() => SNES_BUTTONS.flatMap(button => {
    const bound = (activeProfile?.mappings ?? [])
      .map((mapping, mappingIndex) => ({ mapping, mappingIndex }))
      .filter(({ mapping }) => mapping.snesButton === button);
    if (bound.length === 0) return [{ ...buttonDisplayMapping({ button, mapping: undefined, multiController, devices }), mappingIndex: -1 }];
    return bound.map(({ mapping, mappingIndex }) => ({ ...buttonDisplayMapping({ button, mapping, multiController, devices }), mappingIndex }));
  }), [activeProfile, devices, multiController]);

  return { requiredInputs, displayMappings };
};

export { useDisplayMappings };
