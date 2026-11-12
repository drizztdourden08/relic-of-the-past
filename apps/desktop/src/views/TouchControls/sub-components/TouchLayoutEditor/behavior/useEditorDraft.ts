/* @layer renderer-app @kind hook */
import { useState } from 'react';
import type { OrientationLayout } from '@rotp/features';
import { DEFAULT_TOUCH_CONTROLS } from '@rotp/input-mapping';
import type { TouchEditorSelection, TouchSharedDraft } from '../TouchLayoutEditor.state.type';
import { diffSharedDraft } from './diff-shared-draft';
import { pickSharedDraft } from './pick-shared-draft';
import type { EditorDraftInput } from './useEditorDraft.type';

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
