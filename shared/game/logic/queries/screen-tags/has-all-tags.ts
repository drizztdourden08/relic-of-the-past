/* @layer shared-game @kind logic */
import type { ScreenTag } from '../../../data';

const hasAllTags = (screenTags: readonly ScreenTag[], required: ScreenTag[]): boolean =>
  required.every(t => screenTags.includes(t));

export { hasAllTags };
