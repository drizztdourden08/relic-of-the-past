/* @layer renderer-components @kind logic */
import columnsIcon from '@iconify-icons/lucide/columns';
import rowsIcon from '@iconify-icons/lucide/rows';
import layersIcon from '@iconify-icons/lucide/layers';
import gridIcon from '@iconify-icons/lucide/grid-3x3';
import layoutIcon from '@iconify-icons/lucide/layout';
import moveHorizontalIcon from '@iconify-icons/lucide/move-horizontal';
import typeIcon from '@iconify-icons/lucide/type';
import circleDotIcon from '@iconify-icons/lucide/circle-dot';
import repeatIcon from '@iconify-icons/lucide/repeat';
import gitBranchIcon from '@iconify-icons/lucide/git-branch';
import zapIcon from '@iconify-icons/lucide/zap';
import timerIcon from '@iconify-icons/lucide/timer';
import {
  newButton, newContainer, newCountdown, newElement, newGrid, newOverlap, newRepeat, newSwitch, newText,
} from '../new-node';
import { menuIcon } from './menu-icon';
import type { MenuNode } from '@drizztdourden08/tessera/composites';
import type { MenuDeps, ToolbarGroup } from './toolbar-menus.type';

const containerItems = (deps: MenuDeps): MenuNode[] => ([
  { id: 'row', icon: menuIcon(columnsIcon), label: 'Row', onSelect: () => deps.insert(newContainer('row')) },
  { id: 'column', icon: menuIcon(rowsIcon), label: 'Column', onSelect: () => deps.insert(newContainer('column')) },
  { id: 'overlay', icon: menuIcon(layersIcon), label: 'Overlay', onSelect: () => deps.insert(newOverlap()) },
  { id: 'grid', icon: menuIcon(gridIcon), label: 'Grid', onSelect: () => deps.insert(newGrid()) },
]);

const dynamicsItems = (deps: MenuDeps): MenuNode[] => ([
  { id: 'text', icon: menuIcon(typeIcon), label: 'Text', onSelect: () => deps.insert(newText()) },
  { id: 'button', icon: menuIcon(circleDotIcon), label: 'Button', onSelect: () => deps.insert(newButton()) },
  { id: 'repeat', icon: menuIcon(repeatIcon), label: 'Repeat', onSelect: () => deps.insert(newRepeat()) },
  { id: 'switch', icon: menuIcon(gitBranchIcon), label: 'Switch', onSelect: () => deps.insert(newSwitch()) },
  { id: 'countdown', icon: menuIcon(timerIcon), label: 'Countdown', onSelect: () => deps.insert(newCountdown()) },
]);

const buildToolbarGroups = (deps: MenuDeps): ToolbarGroup[] => [
  { key: 'container', icon: layoutIcon, label: 'Container', items: containerItems(deps) },
  {
    key: 'spacer',
    icon: moveHorizontalIcon,
    label: 'Spacer',
    items: [{
      id: 'spacer', icon: menuIcon(moveHorizontalIcon), label: 'Spacer', onSelect: () => deps.insert(newElement({ type: 'spacer' })),
    }],
  },
  { key: 'dynamics', icon: zapIcon, label: 'Dynamics', items: dynamicsItems(deps) },
];

export { buildToolbarGroups };
