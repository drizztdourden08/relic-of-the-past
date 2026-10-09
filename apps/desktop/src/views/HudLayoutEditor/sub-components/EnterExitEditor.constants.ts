/* @layer renderer-components @kind constants */
import type { HudEnterExitProperty } from '@rotp/hud';

const OPTIONS: readonly { value: HudEnterExitProperty; label: string }[] = [
  { value: 'opacity', label: 'fade' }, { value: 'scale', label: 'scale' }, { value: 'position', label: 'slide' },
];

const DEFAULT_MS = 200;

export { DEFAULT_MS, OPTIONS };
