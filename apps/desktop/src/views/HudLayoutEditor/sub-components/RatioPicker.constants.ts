/* @layer renderer-components @kind constants */
import { EDITOR_RATIOS } from '../HudLayoutEditor.constants';
import type { Translate } from '@app/hud-layout-editing/translate.type';

const ratioOptions = (t: Translate) => EDITOR_RATIOS.map((ratio) => ({
  value: ratio.id,
  label: ratio.label,
  title: t('hud-editor:ratio-picker.title', { w: ratio.view.w, h: ratio.view.h }),
}));

export { ratioOptions };
