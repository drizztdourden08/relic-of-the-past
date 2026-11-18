/* @layer renderer-components @kind logic */
import type { Translate } from '@app/hud-layout-editing/translate.type';

const rangeNote = (n: number, min: number | undefined, max: number | undefined, t: Translate): string | undefined => {
  if (min !== undefined && n < min) return t('hud-editor:range.below', { min });
  if (max !== undefined && n > max) return t('hud-editor:range.above', { max });
  return undefined;
};

export { rangeNote };
