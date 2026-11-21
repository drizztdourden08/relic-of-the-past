/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { HudEnterExitProperty } from '@rotp/hud';

const OPTIONS: readonly { value: HudEnterExitProperty; label: Message }[] = [
  { value: 'opacity', label: msg('hud-editor:enter-exit.fade') }, { value: 'scale', label: msg('hud-editor:enter-exit.scale') }, { value: 'position', label: msg('hud-editor:enter-exit.slide') },
];

const DEFAULT_MS = 200;

export { DEFAULT_MS, OPTIONS };
