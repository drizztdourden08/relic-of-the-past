/* @layer renderer-components @kind logic */
import { KEYBOARD_DEFAULT } from '@rotp/input-mapping';
import type { InputProfile } from '@rotp/input-mapping';

const buildCustomProfile = (existingCount: number): InputProfile => ({
  id: `custom-${Date.now()}`,
  name: `Custom Profile ${existingCount + 1}`,
  deviceType: 'keyboard',
  deviceFamily: 'keyboard',
  mappings: [...KEYBOARD_DEFAULT.defaultMappings],
  isDefault: false,
  assignedDevice: null,
  createdAt: Date.now(),
  modifiedAt: Date.now(),
});

export { buildCustomProfile };
