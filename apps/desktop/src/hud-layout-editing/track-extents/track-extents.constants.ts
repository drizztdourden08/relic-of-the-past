/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { ExtentMode } from './track-extents.type';

const EXTENT_MODES: readonly { mode: ExtentMode; label: Message; suffix: string }[] = [
  { mode: 'auto', label: msg('hud-editing:extent.auto'), suffix: 'auto' },
  { mode: 'fill', label: msg('hud-editing:extent.fill'), suffix: 'fill' },
  { mode: 'px', label: msg('hud-editing:extent.px'), suffix: 'px' },
  { mode: 'pct', label: msg('hud-editing:extent.pct'), suffix: '%' },
];

export { EXTENT_MODES };
