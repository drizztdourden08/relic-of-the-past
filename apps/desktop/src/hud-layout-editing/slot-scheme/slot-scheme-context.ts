/* @layer renderer-components @kind logic */
import { createContext } from 'react';
import type { ModernSlot } from '@rotp/game-data';

const SlotSchemeContext = createContext<readonly ModernSlot[]>([]);

export { SlotSchemeContext };
