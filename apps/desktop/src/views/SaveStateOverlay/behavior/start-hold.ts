/* @layer renderer-components @kind logic */
import type { ShortcutContext } from '../SaveStateOverlay.type';
import { buildHoldingHints } from './build-holding-hints';

const startHold = (ctx: ShortcutContext, slot: number): void => {
  const { hold, holdDurationMs, mappings, setHints, setHoldProgress } = ctx;
  hold.start = performance.now();
  hold.slot = slot;
  hold.complete = false;
  hold.awaiting = true;
  setHints(buildHoldingHints(mappings, slot));

  const tick = (): void => {
    if (hold.start == null) return;
    const elapsed = performance.now() - hold.start;
    const progress = Math.min(elapsed / holdDurationMs, 1);
    setHoldProgress(progress);

    if (progress >= 1) {
      hold.complete = true;
      hold.anim = null;
      return;
    }
    hold.anim = requestAnimationFrame(tick);
  };
  hold.anim = requestAnimationFrame(tick);
};

export { startHold };
