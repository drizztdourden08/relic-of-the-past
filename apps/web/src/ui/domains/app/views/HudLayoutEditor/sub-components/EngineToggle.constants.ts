/* @layer renderer-components @kind constants */
import flexIcon from '@iconify-icons/lucide/align-horizontal-distribute-center';
import gridIcon from '@iconify-icons/lucide/grid-3x3';
import type { EngineOption } from './EngineToggle.type';

const ENGINES: readonly EngineOption[] = [
  { value: 'flex', icon: flexIcon, label: 'flex. Children flow in one line' },
  { value: 'grid', icon: gridIcon, label: 'grid. Children sit in cells' },
];

export { ENGINES };
