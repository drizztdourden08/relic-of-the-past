/* @layer renderer-components @kind logic */
import { loadState, saveState } from '../../../game';
import { log } from '../../../log-bus';
import { TAP_THRESHOLD_MS } from '../SaveStateOverlay.constants';
import type { ShortcutContext } from '../SaveStateOverlay.type';
import { buildIdleHints } from './build-idle-hints';
import { withPauseGuard } from './with-pause-guard';
import { cancelHold } from './cancel-hold';
import { heldMs } from './held-ms';
import { slotOfAction } from './slot-of-action';

const handleFunctionKeyUp = (ctx: ShortcutContext, action: string): void => {
  if (!ctx.enabled || !ctx.isOpen.current) return;
  if (!ctx.hold.awaiting) return;

  const slot = slotOfAction(action);
  if (slot === undefined || ctx.hold.slot !== slot) return;

  const elapsed = heldMs(ctx.hold, ctx.holdDurationMs);

  if (ctx.hold.complete || elapsed >= ctx.holdDurationMs) {
    cancelHold(ctx);
    log.app(`[Enhanced] Save to slot ${slot}`);
    void withPauseGuard(() => saveState(slot)).then(() => ctx.close());
  } else if (elapsed < TAP_THRESHOLD_MS) {
    cancelHold(ctx);
    log.app(`[Enhanced] Load from slot ${slot}`);
    void withPauseGuard(() => loadState(slot)).then(() => ctx.close());
  } else {
    cancelHold(ctx);
    ctx.setHints(buildIdleHints(ctx.mappings, slot));
  }
};

export { handleFunctionKeyUp };
