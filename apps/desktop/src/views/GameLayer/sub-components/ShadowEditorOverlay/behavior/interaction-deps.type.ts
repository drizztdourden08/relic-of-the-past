/* @layer renderer-components @kind types */
import type { RefObject } from 'react';
import type { GizmoStart } from '../ShadowEditorOverlay.type';
import type { OverlayRefs } from './overlay.type';

interface InteractionRefs extends OverlayRefs {
  gizmoStartRef: RefObject<GizmoStart | null>;
  dragMovedRef: RefObject<boolean>;
}

interface InteractionSize {
  width: number;
  height: number;
}

export type { InteractionRefs, InteractionSize };
