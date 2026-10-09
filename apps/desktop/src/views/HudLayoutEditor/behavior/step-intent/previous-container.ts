/* @layer renderer-components @kind logic */
import type { HudContainer } from '@rotp/hud';

const previousContainer = (parent: HudContainer, index: number): HudContainer | null => {
  const before = index > 0 ? parent.children[index - 1] : undefined;
  return before?.kind === 'container' ? before : null;
};

export { previousContainer };
