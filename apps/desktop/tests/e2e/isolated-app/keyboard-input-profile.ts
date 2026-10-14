/* @layer tests @kind helper */
// eslint-disable-next-line local/no-cross-package-relative
import { KEYBOARD_DEFAULT } from '../../../../../packages/input-mapping/src/keyboard-default';
import type { StoredSlotSeed } from './isolated-app.type';

const modernSlotOf = ({ index, code, label }: StoredSlotSeed) => ({
  index,
  binding: { type: 'keyboard', code, label },
  label,
  icon: null,
});

const keyboardInputProfile = (now: number, storedSlots?: readonly StoredSlotSeed[]) => ({
  id: KEYBOARD_DEFAULT.id,
  name: KEYBOARD_DEFAULT.name,
  deviceType: 'keyboard',
  deviceFamily: KEYBOARD_DEFAULT.family,
  mappings: KEYBOARD_DEFAULT.defaultMappings,
  isDefault: true,
  assignedDevice: null,
  createdAt: now,
  modifiedAt: now,
  ...(storedSlots ? { modern: { slots: storedSlots.map(modernSlotOf) } } : {}),
});

export { keyboardInputProfile };
