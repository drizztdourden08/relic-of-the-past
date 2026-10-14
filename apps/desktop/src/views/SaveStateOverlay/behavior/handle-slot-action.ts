/* @layer renderer-components @kind logic */
import type { ShortcutContext } from '../SaveStateOverlay.type';
import { buildIdleHints } from './build-idle-hints';
import { cancelHold } from './cancel-hold';
import { startHold } from './start-hold';

const highlightSlot = (ctx: ShortcutContext, slot: number): void => {
  cancelHold(ctx);
  ctx.pending.current = slot;
  ctx.setHighlightedSlot(slot);
  ctx.setHoldProgress(0);
  ctx.setHints(buildIdleHints(ctx.mappings, slot));
};

const handleSlotAction = (ctx: ShortcutContext, slot: number): void => {
  if (!ctx.enabled) return;

  if (!ctx.isOpen.current) {
    highlightSlot(ctx, slot);
    ctx.setOpen(true);
    return;
  }

  if (ctx.pending.current !== slot) {
    highlightSlot(ctx, slot);
    return;
  }

  startHold(ctx, slot);
};

export { handleSlotAction };
