/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import { allowedDevices, resolveFunctionMappingIcon } from '@rotp/input-mapping';
import { resolveLiveFamilyIcon } from './family-icon-map';
import { findLiveDevice } from './live-device';
import { padHexOrNull } from './pad-hex-or-null';
import type { DisplayFunctionMapping, UseDisplayFunctionMappingsArgs } from './controls-settings.type';

const useDisplayFunctionMappings = ({ functionMappings, activeProfile, devices }: UseDisplayFunctionMappingsArgs) => {
  const multiController = useMemo(() => allowedDevices(activeProfile).gamepadKeys.size > 1, [activeProfile]);

  const displayFunctionMappings: DisplayFunctionMapping[] = useMemo(() => functionMappings.map(m => {
    const vid = padHexOrNull(m.sourceVid);
    const pid = padHexOrNull(m.sourcePid);
    const liveDevice = vid && pid ? findLiveDevice(vid, pid, devices) : undefined;
    const icon = resolveFunctionMappingIcon(m, liveDevice?.sdlType);
    const deviceIconUrl = multiController && vid && pid ? resolveLiveFamilyIcon({ vid, pid, devices }) : null;
    return { ...(icon ? { ...m, icon } : m), deviceIconUrl };
  }), [functionMappings, devices, multiController]);

  return displayFunctionMappings;
};

export { useDisplayFunctionMappings };
