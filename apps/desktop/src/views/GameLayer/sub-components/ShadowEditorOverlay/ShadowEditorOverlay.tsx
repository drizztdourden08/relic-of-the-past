/* @layer renderer-components @kind component */
import { useRef } from 'react';
import { Canvas } from '@drizztdourden08/tessera/primitives';
import { useShadowEditorStore } from '../../../../stores/shadow-editor-store';
import type { GizmoPart } from './behavior/gizmo.type';
import type { Vp, Point } from './behavior/overlay.type';
import type { GizmoStart, ShadowEditorOverlayProps } from './ShadowEditorOverlay.type';
import { interactionDeps } from './behavior/interaction-deps';
import { useOverlayKeyboard } from './behavior/useOverlayKeyboard';
import { useOverlayInteractions } from './behavior/useOverlayInteractions';
import { useOverlayRender } from './behavior/useOverlayRender';
import './ShadowEditorOverlay.css';

const ShadowEditorOverlay = (props: ShadowEditorOverlayProps) => {
  const { width, height, gameRunning } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vpRef = useRef<Vp | null>(null);
  const mouseDisplayRef = useRef<Point | null>(null);
  const hoveredGizmoRef = useRef<GizmoPart | null>(null);
  const activeGizmoRef = useRef<GizmoPart | null>(null);
  const gizmoStartRef = useRef<GizmoStart | null>(null);
  const dragMovedRef = useRef<boolean>(false);

  const s = useShadowEditorStore();
  const refs = { canvasRef, vpRef, mouseDisplayRef, hoveredGizmoRef, activeGizmoRef, gizmoStartRef, dragMovedRef };

  useOverlayKeyboard({ open: s.open, loadProject: s.loadProject, vpRef });

  const interactions = useOverlayInteractions(interactionDeps(s, refs, { width, height }));

  useOverlayRender({
    ...refs,
    open: s.open, gameRunning, width, height,
    selectedElementId: s.selectedElementId,
    freehandPoints: s.freehandPoints,
    isDrawingFreehand: s.isDrawingFreehand,
    project: s.project,
    getScreenData: s.getScreenData,
  });

  if (!s.open || !gameRunning) return null;

  return (
    <Canvas
      ref={canvasRef}
      className={s.previewMode ? 'shadow-editor-overlay' : 'shadow-editor-overlay shadow-editor-overlay--interactive'}
      data-cursor={interactions.cursor}
      width={width}
      height={height}
      onMouseDown={interactions.handleMouseDown}
      onMouseMove={interactions.handleMouseMove}
      onMouseUp={interactions.handleMouseUp}
      onContextMenu={interactions.handleContextMenu}
      onDoubleClick={interactions.handleDoubleClick}
    />
  );
};

export { ShadowEditorOverlay };
