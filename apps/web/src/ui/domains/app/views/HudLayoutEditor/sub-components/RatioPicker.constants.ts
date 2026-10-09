/* @layer renderer-components @kind constants */
import { EDITOR_RATIOS } from '../HudLayoutEditor.constants';

const RATIO_OPTIONS = EDITOR_RATIOS.map((ratio) => ({
  value: ratio.id,
  label: ratio.label,
  title: `${ratio.view.w} x ${ratio.view.h} game pixels`,
}));

export { RATIO_OPTIONS };
