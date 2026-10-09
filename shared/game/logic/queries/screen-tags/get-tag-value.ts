/* @layer shared-game @kind logic */
import type { ScreenTag } from '../../../data';

const getTagValue = (tag: ScreenTag): string => tag.split(':')[1];

export { getTagValue };
