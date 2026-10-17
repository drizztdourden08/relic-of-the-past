/* @layer renderer-components @kind constants */
import type { ArmedAction } from './behavior/useArmedAction.type';

const ARM_TIMEOUT_MS = 3000;

const ARMED_GLYPHS: Readonly<Record<ArmedAction, string>> = {
  // eslint-disable-next-line local/no-smart-punctuation
  load: '📂',
  // eslint-disable-next-line local/no-smart-punctuation
  save: '💾',
  // eslint-disable-next-line local/no-smart-punctuation
  delete: '🗑️',
};

export { ARM_TIMEOUT_MS, ARMED_GLYPHS };
