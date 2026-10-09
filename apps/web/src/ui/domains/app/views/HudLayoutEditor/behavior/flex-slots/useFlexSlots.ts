/* @layer renderer-components @kind hook */
import { useContext } from 'react';
import { FlexSlotContext } from './flex-slot-context';
import type { HudContainer } from '@shared/types/hud';
import type { FlexSlot } from './flex-slots.type';

const useFlexSlots = (container: HudContainer): readonly FlexSlot[] =>
  useContext(FlexSlotContext)(container);

export { useFlexSlots };
