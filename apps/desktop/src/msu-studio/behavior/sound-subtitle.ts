/* @layer renderer-components @kind logic */
import type { SubtitleCounts } from './sound-subtitle.type';

const soundPanelSubtitle = (counts: SubtitleCounts): string => {
  const { total, raisedCount, reachableCount, hiddenCount, showUnreachable } = counts;
  if (counts.channel !== 'ambient') return `${raisedCount} of ${total} ids are used by the game.`;
  const tail = showUnreachable ? '' : ` ${hiddenCount} more hidden.`;
  return `${reachableCount} of ${total} ids are used by the game.${tail}`;
};

export { soundPanelSubtitle };
