/* @layer renderer-components @kind logic */
import { createContext } from 'react';
import { NONE } from './flex-slots.constants';
import type { FlexSlotLookup } from './flex-slots.type';

const FlexSlotContext = createContext<FlexSlotLookup>(NONE);

export { FlexSlotContext };
