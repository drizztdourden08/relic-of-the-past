/* @layer shared-game @kind logic */
/** Screen tag query helpers, moved from data/screens/tags.ts when logic split out of data. */
import type { ScreenTag } from '../../data';

const hasAllTags = (screenTags: readonly ScreenTag[], required: ScreenTag[]): boolean =>
  required.every(t => screenTags.includes(t));

const hasAnyTag = (screenTags: readonly ScreenTag[], candidates: ScreenTag[]): boolean =>
  candidates.some(t => screenTags.includes(t));

const getTagNamespace = (tag: ScreenTag): string => tag.split(':')[0];

const getTagValue = (tag: ScreenTag): string => tag.split(':')[1];

export { getTagNamespace, getTagValue, hasAllTags, hasAnyTag };
