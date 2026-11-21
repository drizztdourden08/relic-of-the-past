/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { SubtitleCounts } from './sound-subtitle.type';

const soundPanelSubtitle = (t: I18n['t'], counts: SubtitleCounts): string => {
  const { total, raisedCount, reachableCount, hiddenCount, showUnreachable } = counts;
  if (counts.channel !== 'ambient') return t('msu-studio:sound.subtitle.additive', { raised: raisedCount, total });
  if (showUnreachable) return t('msu-studio:sound.subtitle.ambient', { reachable: reachableCount, total });
  return t('msu-studio:sound.subtitle.ambient-hidden', { reachable: reachableCount, total, hidden: hiddenCount });
};

export { soundPanelSubtitle };
