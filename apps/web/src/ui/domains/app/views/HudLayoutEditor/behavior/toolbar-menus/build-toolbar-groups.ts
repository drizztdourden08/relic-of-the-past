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
import type { MenuEntry } from '@drizztdourden08/tessera/composites';
import type { MenuDeps, ToolbarGroup } from './toolbar-menus.type';

const containerItems = (deps: MenuDeps): MenuEntry[] => ([
  { key: 'row', icon: columnsIcon, label: 'Row', onClick: () => deps.insert(newContainer('row')) },
  { key: 'column', icon: rowsIcon, label: 'Column', onClick: () => deps.insert(newContainer('column')) },
  { key: 'overlay', icon: layersIcon, label: 'Overlay', onClick: () => deps.insert(newOverlap()) },
  { key: 'grid', icon: gridIcon, label: 'Grid', onClick: () => deps.insert(newGrid()) },
]);

const dynamicsItems = (deps: MenuDeps): MenuEntry[] => ([
  { key: 'text', icon: typeIcon, label: 'Text', onClick: () => deps.insert(newText()) },
  { key: 'button', icon: circleDotIcon, label: 'Button', onClick: () => deps.insert(newButton()) },
  { key: 'repeat', icon: repeatIcon, label: 'Repeat', onClick: () => deps.insert(newRepeat()) },
  { key: 'switch', icon: gitBranchIcon, label: 'Switch', onClick: () => deps.insert(newSwitch()) },
  { key: 'countdown', icon: timerIcon, label: 'Countdown', onClick: () => deps.insert(newCountdown()) },
]);

const buildToolbarGroups = (deps: MenuDeps): ToolbarGroup[] => [
  { key: 'container', icon: layoutIcon, label: 'Container', items: containerItems(deps) },
  {
    key: 'spacer',
    icon: moveHorizontalIcon,
    label: 'Spacer',
    items: [{ key: 'spacer', icon: moveHorizontalIcon, label: 'Spacer', onClick: () => deps.insert(newElement({ type: 'spacer' })) }],
  },
  { key: 'dynamics', icon: zapIcon, label: 'Dynamics', items: dynamicsItems(deps) },
];

export { buildToolbarGroups };
