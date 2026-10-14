/* @layer tests @kind helper */
import { KEYBOARD_DEFAULT } from '../../../../../packages/input-mapping/src/keyboard-default';
import type { ModernSlotSeed } from './isolated-app.type';

const modernSlotOf = ({ index, code, label }: ModernSlotSeed) => ({
  index,
  binding: { type: 'keyboard', code, label },
  label,
  icon: null,
});

// Without an input profile the app receives no key events at all, so every seeded profile carries the keyboard default.
const keyboardInputProfile = (now: number, modernSlots?: readonly ModernSlotSeed[]) => ({
  id: KEYBOARD_DEFAULT.id,
  name: KEYBOARD_DEFAULT.name,
  deviceType: 'keyboard',
  deviceFamily: KEYBOARD_DEFAULT.family,
  mappings: KEYBOARD_DEFAULT.defaultMappings,
  isDefault: true,
  assignedDevice: null,
  createdAt: now,
  modifiedAt: now,
  ...(modernSlots ? { modern: { slots: modernSlots.map(modernSlotOf) } } : {}),
});

export { keyboardInputProfile };
