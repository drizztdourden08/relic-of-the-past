/* @layer bridge-wasm @kind logic */
import type { NoticePart } from './online-notices.type';

const playerPart = (text: string): NoticePart => ({ text, tone: 'player' });

export { playerPart };
