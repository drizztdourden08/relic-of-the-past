/* @layer shared-hud @kind logic */
import { failureMessage } from './failure-message';
import { tryLoadLayout } from './try-load-layout';
import type { HudLayout } from '../../types/hud-layout';

const loadLayout = (value: unknown, source = 'this layout'): HudLayout => {
  const result = tryLoadLayout(value);
  if (!result.ok) throw new Error(failureMessage(source, result.errors));
  return result.doc;
};

export { loadLayout };
