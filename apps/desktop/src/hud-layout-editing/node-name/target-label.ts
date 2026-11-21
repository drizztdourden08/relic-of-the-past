/* @layer renderer-components @kind logic */
import { nodeName } from './node-name';
import type { Translate } from '../translate.type';

const targetLabel = (target: string | null | undefined, screenId: string, t: Translate): string => {
  if (target === screenId) return t('hud-editor:editor.target.screen');
  if (!target) return t('hud-editor:editor.target.nothing');
  return nodeName(target, t);
};

export { targetLabel };
