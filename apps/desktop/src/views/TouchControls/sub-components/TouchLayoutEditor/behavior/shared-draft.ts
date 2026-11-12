/* @layer renderer-app @kind logic */
import type { TouchControlsSettings } from '@rotp/features';
import type { TouchSharedPatch } from '../TouchLayoutEditor.type';
import type { TouchSharedDraft } from '../TouchLayoutEditor.state.type';

const pickSharedDraft = (touch: TouchControlsSettings): TouchSharedDraft => ({
  buttonStrength: touch.buttonStrength,
  layerOpacity: touch.layerOpacity,
  haptics: touch.haptics,
  snap: { ...touch.snap },
  menuHoldMs: touch.menuHoldMs,
});

/** Only the fields whose draft value differs from the saved one. */
const diffSharedDraft = (saved: TouchControlsSettings, draft: TouchSharedDraft): TouchSharedPatch => {
  const patch: TouchSharedPatch = {};
  if (draft.buttonStrength !== saved.buttonStrength) patch.buttonStrength = draft.buttonStrength;
  if (draft.layerOpacity !== saved.layerOpacity) patch.layerOpacity = draft.layerOpacity;
  if (draft.haptics !== saved.haptics) patch.haptics = draft.haptics;
  if (draft.menuHoldMs !== saved.menuHoldMs) patch.menuHoldMs = draft.menuHoldMs;
  if (draft.snap.enabled !== saved.snap.enabled || draft.snap.cell !== saved.snap.cell) patch.snap = draft.snap;
  return patch;
};

export { diffSharedDraft, pickSharedDraft };
