/* @layer renderer-components @kind hook */
import { useContext } from 'react';
import { SlotSchemeContext } from './slot-scheme-context';
import type { ModernSlot } from '@rotp/game-data';

const useSlotScheme = (): readonly ModernSlot[] => useContext(SlotSchemeContext);

export { useSlotScheme };
