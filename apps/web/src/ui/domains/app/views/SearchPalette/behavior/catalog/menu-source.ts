/* @layer renderer-components @kind logic */
import type { MenuEntry } from '@drizztdourden08/tessera/composites';
import { buildTitleBarMenuItems } from '../../../TitleBar/behavior/title-bar-menu';
import type { SearchContext, SearchEntry, SearchSource } from '../../SearchPalette.type';

const walk = (items: MenuEntry[], trail: string[]): SearchEntry[] =>
  items.flatMap((item): SearchEntry[] => {
    if (item === 'separator') return [];
    const breadcrumb = [...trail, item.label];
    if (item.children) return walk(item.children, breadcrumb);
    return [{
      id: `menu:${item.key}`,
      kind: trail.length ? 'action' : 'screen',
      label: item.label,
      icon: typeof item.icon === 'string' ? item.icon : undefined,
      breadcrumb: trail,
      keywords: breadcrumb.join(' '),
      disabled: item.disabled,
      checked: item.checked,
      run: item.onClick,
    }];
  });

const build = (ctx: SearchContext): SearchEntry[] => {
  const items = buildTitleBarMenuItems({
    ...ctx.navProps,
    win: ctx.win,
    closeMenu: ctx.closePalette,
  } as Parameters<typeof buildTitleBarMenuItems>[0]);
  return walk(items, []);
};

const menuSource: SearchSource = { id: 'menu', build };

export { menuSource };
