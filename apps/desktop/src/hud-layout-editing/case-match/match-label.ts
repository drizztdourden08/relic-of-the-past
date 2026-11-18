/* @layer renderer-components @kind logic */
import type { Translate } from '../translate.type';

const matchLabel = (wins: number, total: number, t: Translate): string | null => {
  if (wins === 0) return null;
  return total === 1 ? t('hud-editing:case.matches-now') : t('hud-editing:case.matches', { wins, total });
};

export { matchLabel };
