/* @layer renderer-app @kind types */
import type { OrientationLayout, TouchControlsSettings, TouchOrientation } from '@rotp/features';
import type { ScreenBox } from '@rotp/input-mapping';

/** Settings shared by both orientations that the editor can change. */
type TouchSharedPatch = Partial<Omit<TouchControlsSettings, 'layouts'>>;

interface TouchLayoutEditorProps {
  /** The current orientation's saved layout; the editor works on a draft copy. */
  layout: OrientationLayout;
  orientation: TouchOrientation;
  /** The overlay's size in px. */
  box: ScreenBox;
  /** The saved settings, for strength, opacity, snap and the rest. */
  touch: TouchControlsSettings;
  /** Done: save the draft layout for this orientation plus any shared settings changed. */
  onSave: (layout: OrientationLayout, shared: TouchSharedPatch) => void;
  /** Cancel: leave without saving. */
  onClose: () => void;
}

export type { TouchLayoutEditorProps, TouchSharedPatch };
