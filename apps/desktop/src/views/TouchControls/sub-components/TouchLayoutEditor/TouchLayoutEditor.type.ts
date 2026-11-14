/* @layer renderer-app @kind types */
import type { OrientationLayout, TouchControlsSettings, TouchOrientation } from '@rotp/features';
import type { ScreenBox } from '@rotp/input-mapping';

type TouchSharedPatch = Partial<Omit<TouchControlsSettings, 'layouts'>>;

interface TouchLayoutEditorProps {
  layout: OrientationLayout;
  orientation: TouchOrientation;
  box: ScreenBox;
  touch: TouchControlsSettings;
  onSave: (layout: OrientationLayout, shared: TouchSharedPatch) => void;
  onClose: () => void;
}

export type { TouchLayoutEditorProps, TouchSharedPatch };
