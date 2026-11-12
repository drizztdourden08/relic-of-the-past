/* @layer renderer-app @kind types */
import type { OrientationLayout, TouchOrientation } from '@rotp/features';
import type { ScreenBox } from '@rotp/input-mapping';
import type { useEditorActions } from '../../behavior/useEditorActions';
import type { TouchEditorSelection, TouchSharedDraft } from '../../TouchLayoutEditor.state.type';

interface TouchEditorCardsProps {
  selection: TouchEditorSelection;
  layout: OrientationLayout;
  orientation: TouchOrientation;
  box: ScreenBox;
  shared: TouchSharedDraft;
  actions: ReturnType<typeof useEditorActions>;
  onShared: (patch: Partial<TouchSharedDraft>) => void;
  onReset: () => void;
}

export type { TouchEditorCardsProps };
