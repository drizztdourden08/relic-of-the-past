/* @layer renderer-components @kind logic */
import type { Translate } from '@app/hud-layout-editing/translate.type';

const summarise = (values: readonly number[], t: Translate): string => {
  const booleanish = values.every((v) => v === 0 || v === 1);
  if (booleanish) return t('hud-editor:summary.true-on', { on: values.filter((v) => v === 1).length, total: values.length });
  const full = values.filter((v) => v >= 1).length;
  const empty = values.filter((v) => v <= 0).length;
  if (full + empty === values.length) return t('hud-editor:summary.full-empty', { full, empty });
  return `${Math.min(...values)} ... ${Math.max(...values)}`;
};

export { summarise };
