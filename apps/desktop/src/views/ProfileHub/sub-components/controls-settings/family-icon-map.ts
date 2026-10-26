/* @layer renderer-components @kind logic */
import { buildDisplayContext, resolveBrandLogoKey } from '@drizztdourden08/brock-input';
import { recallControllerSdlType } from '@drizztdourden08/brock-input/renderer';
import { FAMILY_ICON_MAP, GENERIC_CONTROLLER_ICON } from './controls-settings.constants';
import { findLiveDevice } from './live-device';
import type { LiveFamilyIconParams } from './controls-settings.type';

const resolveLiveFamilyIcon = (params: LiveFamilyIconParams): string => {
  const { vid, pid, devices } = params;
  const liveDevice = findLiveDevice(vid, pid, devices);
  const sdlType = recallControllerSdlType(parseInt(vid, 16), parseInt(pid, 16));
  const family = sdlType
    ? (resolveBrandLogoKey(buildDisplayContext({ sdlType })) || 'generic')
    : (liveDevice?.deviceFamily ?? 'generic');
  return FAMILY_ICON_MAP[family] ?? GENERIC_CONTROLLER_ICON;
};

export { resolveLiveFamilyIcon };
