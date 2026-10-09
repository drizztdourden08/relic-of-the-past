/* @layer renderer-components @kind hook */
import { useContext } from 'react';
import { SlotSchemeContext } from './slot-scheme-context';
import type { ModernSlot } from '@shared/types/controls';

const useSlotScheme = (): readonly ModernSlot[] => useContext(SlotSchemeContext);

export { useSlotScheme };
