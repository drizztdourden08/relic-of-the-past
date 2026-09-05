/* @layer renderer-components @kind logic */
/**
 * Flattens the title-bar dropdown menu into search entries: screens (Home, Data Manager's
 * tabs, widgets, Credits/About/Quit) and dev-only advanced commands. This is already the
 * app's cross-platform nav manifest (the mobile drawer reuses it verbatim), and every item
 * carries its own live onClick, so this source needs no upkeep as the menu grows: a new
 * menu item is automatically searchable.
 */
import type { MenuEntry } from '@ds/composites/DropdownMenu';
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
      icon: item.icon,
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
