/* @layer shared-input @kind constants */
import type { TouchControlsSettings } from '@rotp/features';
import { DEFAULT_LANDSCAPE_LAYOUT } from './default-landscape-layout.constants';
import { DEFAULT_PORTRAIT_LAYOUT } from './default-portrait-layout.constants';

const DEFAULT_TOUCH_CONTROLS: TouchControlsSettings = {
  buttonStrength: 0.22,
  layerOpacity: 0,
  haptics: true,
  hapticStrength: 0.25,
  snap: { enabled: false, cell: 'm' },
  editHoldMs: 3000,
  layouts: { landscape: DEFAULT_LANDSCAPE_LAYOUT, portrait: DEFAULT_PORTRAIT_LAYOUT },
  bindings: { classic: {}, verbs: {}, slots: {} },
};

export { DEFAULT_TOUCH_CONTROLS };
