/* @layer renderer-components @kind logic */
import { createContext } from 'react';
import type { ModernSlot } from '@shared/types/controls';

const SlotSchemeContext = createContext<readonly ModernSlot[]>([]);

export { SlotSchemeContext };
