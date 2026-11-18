/* @layer renderer-components @kind constants */
import flexIcon from '@iconify-icons/lucide/align-horizontal-distribute-center';
import gridIcon from '@iconify-icons/lucide/grid-3x3';
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { EngineOption } from './EngineToggle.type';

const ENGINES: readonly EngineOption[] = [
  { value: 'flex', icon: flexIcon, label: msg('hud-editor:engine.flex') },
  { value: 'grid', icon: gridIcon, label: msg('hud-editor:engine.grid') },
];

export { ENGINES };
