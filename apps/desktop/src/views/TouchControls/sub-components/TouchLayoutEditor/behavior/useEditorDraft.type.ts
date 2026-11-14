/* @layer renderer-app @kind types */
import type { OrientationLayout, TouchControlsSettings, TouchOrientation } from '@rotp/features';

interface EditorDraftInput {
  layout: OrientationLayout;
  orientation: TouchOrientation;
  touch: TouchControlsSettings;
}

export type { EditorDraftInput };
