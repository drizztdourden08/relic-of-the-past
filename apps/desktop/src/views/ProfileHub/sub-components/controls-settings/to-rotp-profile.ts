/* @layer renderer-components @kind logic */
import type { ActionBinding, InputProfile as BrockProfile } from '@drizztdourden08/brock-input';
import { SNES_BUTTONS } from '@rotp/game-data';
import type { ButtonMapping, ModernBindings } from '@rotp/game-data';
import type { InputProfile } from '@rotp/input-mapping';
import { coreFromVerbs } from './core-verbs-convert';
import { profileLayoutId } from './profile-layout-id';

const toButtonMapping = (entry: ActionBinding): ButtonMapping[] => {
  const snesButton = SNES_BUTTONS.find((button) => button === entry.action);
  if (!snesButton) return [];
  return [{
    snesButton,
    binding: entry.binding,
    icon: entry.icon,
    sourceVid: entry.sourceVid,
    sourcePid: entry.sourcePid,
  }];
};

const toRotpProfile = (profile: BrockProfile): InputProfile => {
  const layoutId = profileLayoutId(profile);
  const core = profile.verbs ? coreFromVerbs(profile.verbs) : undefined;
  const modern: ModernBindings | undefined = core && (profile.slots || layoutId)
    ? { core, slots: profile.slots ?? [], ...(layoutId ? { layoutId } : {}) }
    : undefined;
  return {
    id: profile.id,
    name: profile.name,
    deviceType: profile.deviceType,
    deviceFamily: profile.deviceFamily,
    mappings: profile.mappings.flatMap(toButtonMapping),
    isDefault: profile.isDefault,
    assignedDevice: profile.assignedDevice,
    createdAt: profile.createdAt,
    modifiedAt: profile.modifiedAt,
    ...(core ? { core } : {}),
    ...(modern ? { modern } : {}),
  };
};

export { toRotpProfile };
