/* @layer renderer-components @kind logic */
import { HEAD_CHARS, MAX_CAPTION, TAIL_CHARS } from './voiceCaptions.constants';

const shortName = (name: string): string =>
  (name.length <= MAX_CAPTION ? name : `${name.slice(0, HEAD_CHARS)}...${name.slice(-TAIL_CHARS)}`);

export { shortName };
