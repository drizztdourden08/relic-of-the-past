/* @layer renderer-components @kind constants */
import type { IconPath } from '@drizztdourden08/tessera/primitives';
import type { DropZone } from '@app/hud-layout-editing/drop-intent';

const DROP_CLASS: Readonly<Record<DropZone, string>> = {
  before: 'is-drop-before',
  'inside-start': 'is-drop-inside is-drop-before',
  'inside-end': 'is-drop-inside is-drop-after',
  after: 'is-drop-after',
};

const CARET_ICON: IconPath = { d: 'M5.5 3 L10.5 8 L5.5 13 Z' };

export { CARET_ICON, DROP_CLASS };
