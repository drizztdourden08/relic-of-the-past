/* @layer shared-game @kind logic */
import { HIGHLIGHT_END, HIGHLIGHT_SECONDARY } from '@rotp/game-core';

const secondary = (text: string): string => (text === '' ? text : `${HIGHLIGHT_SECONDARY}${text}${HIGHLIGHT_END}`);

export { secondary };
