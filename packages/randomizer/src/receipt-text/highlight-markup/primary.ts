/* @layer shared-game @kind logic */
import { HIGHLIGHT_END, HIGHLIGHT_PRIMARY } from '@rotp/game-core';

const primary = (text: string): string => (text === '' ? text : `${HIGHLIGHT_PRIMARY}${text}${HIGHLIGHT_END}`);

export { primary };
