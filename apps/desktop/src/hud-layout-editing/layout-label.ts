/* @layer renderer-components @kind logic */
import type { HudLayout } from '@rotp/hud';
import type { Translate } from './translate.type';

const layoutLabel = (layout: HudLayout, t: Translate): string => {
  if (!layout.builtIn) return layout.name;
  if (layout.id === 'default') return t('hud-editor:layout.name.default');
  if (layout.id === 'compact') return t('hud-editor:layout.name.compact');
  if (layout.id === 'bottom-right') return t('hud-editor:layout.name.bottom-right');
  return layout.name;
};

export { layoutLabel };
