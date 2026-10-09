/* @layer shared-game @kind logic */
import { splitTagKey } from './split-tag-key';

const isTagKey = (key: string): boolean => splitTagKey(key) !== null;

export { isTagKey };
