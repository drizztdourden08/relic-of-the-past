/* @layer renderer-app @kind hook */
import { useState } from 'react';
import type { OrientationLayout, TouchControlsSettings, TouchOrientation } from '@rotp/features';
import { DEFAULT_TOUCH_CONTROLS } from '@rotp/input-mapping';
import type { TouchEditorSelection, TouchSharedDraft } from '../TouchLayoutEditor.state.type';
import { diffSharedDraft, pickSharedDraft } from './shared-draft';

interface EditorDraftInput {
  layout: OrientationLayout;
  orientation: TouchOrientation;
  touch: TouchControlsSettings;
}

const useEditorDraft = ({ layout, orientation, touch }: EditorDraftInput) => {
  const [draft, setDraft] = useState<OrientationLayout>(layout);
  const [shared, setShared] = useState<TouchSharedDraft>(() => pickSharedDraft(touch));
  const [selection, setSelection] = useState<TouchEditorSelection>(null);

  const patchShared = (patch: Partial<TouchSharedDraft>) => setShared((current) => ({ ...current, ...patch }));

  const resetLayout = () => {
    setDraft(DEFAULT_TOUCH_CONTROLS.layouts[orientation]);
    setSelection(null);
  };

  const sharedPatch = () => diffSharedDraft(touch, shared);

  return { draft, setDraft, shared, patchShared, selection, setSelection, resetLayout, sharedPatch };
};

export { useEditorDraft };
