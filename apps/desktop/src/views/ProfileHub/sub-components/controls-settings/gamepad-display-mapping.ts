/* @layer renderer-components @kind logic */
import { resolveIconByVidPid } from '@rotp/input-mapping';
import { resolveLiveFamilyIcon } from './family-icon-map';
import { findLiveDevice } from './live-device';
import { padHexOrNull } from './pad-hex-or-null';
import type { GamepadDisplayMappingParams } from './controls-settings.type';

const gamepadDisplayMapping = ({ mapping, multiController, devices }: GamepadDisplayMappingParams) => {
  const storedIcon = mapping.icon?.key ? mapping.icon : null;
  const vid = padHexOrNull(mapping.sourceVid);
  const pid = padHexOrNull(mapping.sourcePid);
  if (!vid || !pid) return { ...mapping, icon: storedIcon, deviceIconUrl: null };

  const deviceIconUrl = multiController ? resolveLiveFamilyIcon({ vid, pid, devices }) : null;
  const liveSdlType = findLiveDevice(vid, pid, devices)?.sdlType;
  const icon = resolveIconByVidPid(vid, pid, mapping.binding, liveSdlType) ?? storedIcon;
  return { ...mapping, icon, deviceIconUrl };
};

export { gamepadDisplayMapping };
