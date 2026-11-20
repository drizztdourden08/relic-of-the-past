/* @layer renderer-components @kind logic */
import type { InputProfile as BrockProfile } from '@drizztdourden08/brock-input';
import type { InputProfile } from '@rotp/input-mapping';
import { shownProfileName } from '@app/input/profile-name/profile-name';
import { toBrockMappings } from './to-brock-mappings';
import { verbsFromCore } from './verbs-from-core';

const toBrockProfile = (profile: InputProfile, keyboardName: string): BrockProfile => {
  const core = profile.core ?? profile.modern?.core;
  const layoutId = profile.modern?.layoutId;
  return {
    id: profile.id,
    name: shownProfileName(profile, keyboardName),
    deviceType: profile.deviceType,
    deviceFamily: profile.deviceFamily,
    mappings: toBrockMappings(profile.mappings),
    isDefault: profile.isDefault,
    assignedDevice: profile.assignedDevice,
    createdAt: profile.createdAt,
    modifiedAt: profile.modifiedAt,
    ...(core ? { verbs: verbsFromCore(core) } : {}),
    ...(profile.modern ? { slots: profile.modern.slots } : {}),
    ...(layoutId ? { extension: { layoutId } } : {}),
  };
};

export { toBrockProfile };
