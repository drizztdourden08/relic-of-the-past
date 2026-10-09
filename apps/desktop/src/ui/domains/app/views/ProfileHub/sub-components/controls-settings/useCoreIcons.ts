/* @layer renderer-components @kind hook */
import { useMemo } from 'react';
import { resolveIconByVidPid } from '@app/lib/input/profile-utils';
import { findLiveDevice } from './live-device';
import { padHex } from './pad-hex';
import type { CoreVerb } from '@shared/input/scheme';
import type { CoreBindings } from '@shared/types/controls';
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
export type { CoreIcons };
