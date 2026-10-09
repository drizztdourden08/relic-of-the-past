/* @layer shared-game @kind logic */
import type { ScreenTag } from '../../../data';

const getTagNamespace = (tag: ScreenTag): string => tag.split(':')[0];

export { getTagNamespace };
