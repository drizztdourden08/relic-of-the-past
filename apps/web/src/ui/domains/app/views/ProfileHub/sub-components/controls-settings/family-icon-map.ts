/* @layer renderer-components @kind data */
/**
 * One brand silhouette per controller family, shared by the
 * required-inputs strip and the per-binding device glyph so both read the
 * same icon for a given family. resolveLiveFamilyIcon resolves which family
 * a vid:pid belongs to, preferring this session's remembered SDL type and
 * falling back to a currently-connected device's own live family, the same
 * precedence the required-inputs strip already used before this file existed.
 */
import type { DetectedDevice } from '@shared/types/controls';
import { buildDisplayContext, resolveBrandLogoKey } from '@shared/input/family';
import { publicAsset } from '@app/lib/assets/public-asset';
import { recallControllerSdlType } from '@app/lib/input/controller-family-cache';
import { padHex } from './controls-settings.type';

const FAMILY_ICON_MAP: Record<string, string> = {
  xbox: publicAsset('buttons/xbox/controller_xboxseries.svg'),
  nintendo: publicAsset('buttons/switch/controller_switch_pro.svg'),
  playstation: publicAsset('buttons/playstation/controller_playstation5.svg'),
  keyboard: publicAsset('buttons/keyboard/keyboard.svg'),
  generic: publicAsset('buttons/generic/generic_joystick.svg'),
};

const resolveLiveFamilyIcon = (params: { vid: string; pid: string; devices: DetectedDevice[] }): string => {
  const { vid, pid, devices } = params;
  const liveDevice = devices.find(d =>
    d.type === 'gamepad' && d.connected &&
    d.vendorId && d.productId &&
    padHex(d.vendorId) === vid && padHex(d.productId) === pid
  );
  const sdlType = recallControllerSdlType(parseInt(vid, 16), parseInt(pid, 16));
  const family = sdlType
    ? (resolveBrandLogoKey(buildDisplayContext({ sdlType })) || 'generic')
    : (liveDevice?.deviceFamily ?? 'generic');
  return FAMILY_ICON_MAP[family] ?? FAMILY_ICON_MAP.generic;
};

export { FAMILY_ICON_MAP, resolveLiveFamilyIcon };
