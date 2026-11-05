/* @layer renderer-components @kind logic */
import type { ActionBinding } from '@drizztdourden08/brock-input';
import type { ButtonMapping } from '@rotp/game-data';
import type { InputProfile } from '@rotp/input-mapping';
import type { ControlsProfile } from './controls-profile.type';
import { verbsFromCore } from './core-verbs-convert';

const toActionBinding = (mapping: ButtonMapping): ActionBinding => ({
  action: mapping.snesButton,
  binding: mapping.binding,
  icon: mapping.icon,
  sourceVid: mapping.sourceVid,
  sourcePid: mapping.sourcePid,
});

const toBrockMappings = (mappings: readonly ButtonMapping[]): ActionBinding[] => mappings.map(toActionBinding);

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

export { toBrockMappings, toBrockProfile };
