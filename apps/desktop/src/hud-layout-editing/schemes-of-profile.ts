/* @layer renderer-components @kind logic */
import { effectiveSlots } from '@rotp/input-mapping';
import { DEFAULT_LAYOUT } from '@rotp/hud';
import type { InputProfile } from '@rotp/input-mapping';
import type { EditorScheme } from './editor-schemes.type';

const schemesOfProfile = (profile: InputProfile): EditorScheme[] => {
  const modern = profile.modern;
  if (!modern) return [];
  return [{
    id: profile.id,
    name: profile.name,
    deviceType: profile.deviceType,
    slots: effectiveSlots({
      core: modern.core,
      keyboard: profile.deviceType === 'keyboard',
      stored: modern.slots,
    }),
    layoutId: modern.layoutId ?? DEFAULT_LAYOUT.id,
  }];
};

export { schemesOfProfile };
