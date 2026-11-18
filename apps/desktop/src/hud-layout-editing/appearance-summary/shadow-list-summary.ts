/* @layer renderer-components @kind logic */
import type { HudShadow } from '@rotp/hud';
import type { Translate } from '../translate.type';

const shadowListSummary = (shadows: readonly HudShadow[], t: Translate): string => (
  shadows.length === 0 ? t('hud-editing:summary.none') : t('hud-editing:summary.shadows', { count: shadows.length })
);

export { shadowListSummary };
