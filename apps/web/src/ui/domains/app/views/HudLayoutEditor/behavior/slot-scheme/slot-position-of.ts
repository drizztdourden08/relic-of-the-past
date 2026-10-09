/* @layer renderer-components @kind logic */
import type { ModernSlot } from '@shared/types/controls';

const slotPositionOf = (slots: readonly ModernSlot[], index: number): string | undefined =>
  slots.find((slot) => slot.index === index)?.position;

export { slotPositionOf };
