/* @layer renderer-components @kind logic */
import type { HudShadow } from '@shared/types/hud';

const shadowListSummary = (shadows: readonly HudShadow[]): string => (
  shadows.length === 0 ? 'none' : `${shadows.length} shadow${shadows.length === 1 ? '' : 's'}`
);

export { shadowListSummary };
