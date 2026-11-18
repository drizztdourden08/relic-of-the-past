/* @layer renderer-widgets @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';

const magicLevelTitle = (t: I18n['t'], settable: boolean, inPlay: boolean): string | undefined => {
  if (!settable) return t('views-cheats:magic.fixed');
  return inPlay ? undefined : t('views-cheats:magic.locked', { reason: t('views-cheats:inPlay.reason') });
};

export { magicLevelTitle };
