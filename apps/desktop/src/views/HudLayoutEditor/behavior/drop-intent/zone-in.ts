/* @layer renderer-components @kind logic */
import type { DropZone } from './drop-intent.type';

const zoneIn = (at: number, opts: { isContainer: boolean; hasSiblings: boolean }): DropZone => {
  const { isContainer, hasSiblings } = opts;
  if (!isContainer) return hasSiblings && at < 0.25 ? 'before' : 'after';
  if (hasSiblings && at < 0.25) return 'before';
  if (hasSiblings && at > 0.75) return 'after';
  return at < 0.5 ? 'inside-start' : 'inside-end';
};

export { zoneIn };
