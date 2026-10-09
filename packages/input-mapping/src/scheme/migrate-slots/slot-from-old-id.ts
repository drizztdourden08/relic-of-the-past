/* @layer shared-input @kind logic */
import { KEYBOARD_PREFIX, SLOT_PREFIX } from './migrate-slots.constants';
import { SlotMigrationError } from './slot-migration-error';
import type { InputBinding } from '@rotp/game-data';
import type { ModernSlot, SlotIndex } from '@rotp/game-data';

const slotFromOldId = (id: string, index: SlotIndex): ModernSlot => {
  if (id.startsWith(KEYBOARD_PREFIX)) {
    const code = id.slice(KEYBOARD_PREFIX.length);
    const binding: InputBinding = { type: 'keyboard', code };
    return { index, binding, label: code };
  }
  if (id.startsWith(SLOT_PREFIX)) {
    const position = id.slice(SLOT_PREFIX.length);
    return {
      index,
      binding: { type: 'none' },
      position: position as ModernSlot['position'],
      label: position.replace(/_/g, ' '),
    };
  }
  throw new SlotMigrationError(`assignment key "${id}" is neither a slot number nor a stored slot id`);
};

export { slotFromOldId };
