/* @layer renderer-components @kind logic */
import type { InputProfile } from '@rotp/input-mapping';
import type { ControlsProfile } from './controls-profile.type';
import { toBrockMappings } from './to-brock-mappings';
import { verbsFromCore } from './verbs-from-core';

const toBrockProfile = (profile: InputProfile): ControlsProfile => {
  const core = profile.core ?? profile.modern?.core;
  const layoutId = profile.modern?.layoutId;
  return {
    id: profile.id,
    name: profile.name,
    deviceType: profile.deviceType,
    deviceFamily: profile.deviceFamily,
    mappings: toBrockMappings(profile.mappings),
    isDefault: profile.isDefault,
    assignedDevice: profile.assignedDevice,
    createdAt: profile.createdAt,
    modifiedAt: profile.modifiedAt,
    ...(core ? { verbs: verbsFromCore(core) } : {}),
    ...(profile.modern ? { slots: profile.modern.slots } : {}),
    ...(layoutId ? { layoutId } : {}),
  };
};

export { toBrockProfile };
