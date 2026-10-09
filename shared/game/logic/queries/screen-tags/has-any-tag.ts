/* @layer shared-game @kind logic */
import type { ScreenTag } from '../../../data';

const hasAnyTag = (screenTags: readonly ScreenTag[], candidates: ScreenTag[]): boolean =>
  candidates.some(t => screenTags.includes(t));

export { hasAnyTag };
