/* @layer bridge-wasm @kind logic */
import type { NoticePart } from './online-notices.type';

const itemPart = (text: string): NoticePart => ({ text, tone: 'item' });

export { itemPart };
