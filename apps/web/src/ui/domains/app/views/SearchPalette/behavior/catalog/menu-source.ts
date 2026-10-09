/* @layer renderer-components @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import type { MenuItem, MenuNode } from '@drizztdourden08/tessera/composites';
import { Icon } from '@drizztdourden08/tessera/primitives';
import { buildTitleBarMenuItems } from '../../../TitleBar/behavior/title-bar-menu';
import type { SearchContext, SearchEntry, SearchSource } from '../../SearchPalette.type';

const iconOf = (icon: MenuItem['icon']): ReactNode =>
  typeof icon === 'string' ? createElement(Icon, { name: icon }) : icon;

const walk = (nodes: readonly MenuNode[], trail: string[]): SearchEntry[] =>
  nodes.flatMap((node): SearchEntry[] => {
    if ('separator' in node) return [];
    const breadcrumb = [...trail, node.label];
    if (node.children) return walk(node.children, breadcrumb);
    return [{
      id: `menu:${node.id}`,
      kind: trail.length ? 'action' : 'screen',
      label: node.label,
      icon: iconOf(node.icon),
      breadcrumb: trail,
      keywords: breadcrumb.join(' '),
      disabled: node.disabled,
      checked: node.checked,
      run: node.onSelect,
    }];
  });

const build = (ctx: SearchContext): SearchEntry[] => {
  const groups = buildTitleBarMenuItems({
    ...ctx.navProps,
    win: ctx.win,
    closeMenu: ctx.closePalette,
  });
  return groups.flatMap((group) => walk(group.items, []));
};

const menuSource: SearchSource = { id: 'menu', build };

export { menuSource };
