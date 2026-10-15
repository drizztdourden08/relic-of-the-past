/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import { resolveIconByVidPid } from '@rotp/input-mapping';
import { findLiveDevice } from './live-device';
import { padHex } from './pad-hex';
import type { CoreVerb } from '@rotp/input-mapping';
import type { CoreBindings } from '@rotp/game-data';
import type { CoreIcons, UseCoreIconsArgs } from './controls-settings.type';

const useCoreIcons = ({ activeProfile, devices, core }: UseCoreIconsArgs): CoreIcons => {
  return useMemo(() => {
    const assigned = activeProfile?.assignedDevice;
    if (!assigned?.vendorId || !assigned.productId) return {};

    const vid = padHex(assigned.vendorId);
    const pid = padHex(assigned.productId);
    const liveSdlType = findLiveDevice(vid, pid, devices)?.sdlType;

    const icons: CoreIcons = {};
    for (const [verb, binding] of Object.entries(core) as [CoreVerb, CoreBindings[CoreVerb]][]) {
      if (binding.type === 'none' || binding.type === 'keyboard') continue;
      icons[verb] = resolveIconByVidPid(vid, pid, binding, liveSdlType);
    }
    return icons;
  }, [activeProfile, devices, core]);
};

export { useCoreIcons };
