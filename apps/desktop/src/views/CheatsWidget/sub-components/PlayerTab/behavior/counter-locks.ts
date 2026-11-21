/* @layer renderer-widgets @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { CounterKind } from '../PlayerTab.type';

const counterLocks = (t: I18n['t'], kind: CounterKind, inPlay: boolean): { held: string | undefined; max: string | undefined } => {
  const reason = t('views-cheats:inPlay.reason');
  return { held: kind === 'keys' && !inPlay ? reason : undefined, max: inPlay ? undefined : reason };
};

export { counterLocks };
