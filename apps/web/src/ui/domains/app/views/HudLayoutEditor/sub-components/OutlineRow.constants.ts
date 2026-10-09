/* @layer renderer-components @kind constants */
import type { DropZone } from '../behavior/drop-intent';

const DROP_CLASS: Readonly<Record<DropZone, string>> = {
  before: 'is-drop-before',
  'inside-start': 'is-drop-inside is-drop-before',
  'inside-end': 'is-drop-inside is-drop-after',
  after: 'is-drop-after',
};

const CARET_PATH = 'M5.5 3 L10.5 8 L5.5 13 Z';

export { CARET_PATH, DROP_CLASS };
