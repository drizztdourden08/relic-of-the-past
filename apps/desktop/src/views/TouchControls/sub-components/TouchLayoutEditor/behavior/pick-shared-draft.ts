/* @layer renderer-app @kind logic */
import type { TouchControlsSettings } from '@rotp/features';
import type { TouchSharedDraft } from '../TouchLayoutEditor.state.type';

const pickSharedDraft = (touch: TouchControlsSettings): TouchSharedDraft => ({
  buttonStrength: touch.buttonStrength,
  layerOpacity: touch.layerOpacity,
  haptics: touch.haptics,
  snap: { ...touch.snap },
  editHoldMs: touch.editHoldMs,
});

export { pickSharedDraft };
