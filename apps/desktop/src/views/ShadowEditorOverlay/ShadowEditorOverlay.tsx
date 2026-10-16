/* @layer renderer-components @kind component */
import { useRef } from 'react';
import { Canvas } from '@drizztdourden08/tessera/primitives';
import { useEnsureShadowProject } from '@app/shadow-editor';
import { useGameFitStore } from '@app/stores/game-fit-store';
import { useShadowEditorStore } from '@app/stores/shadow-editor-store';
import type { GizmoPart } from './behavior/gizmo.type';
import type { Vp, Point } from './behavior/overlay.type';
import type { GizmoStart } from './ShadowEditorOverlay.type';
import { interactionDeps } from './behavior/interaction-deps';
import { useOverlayKeyboard } from './behavior/useOverlayKeyboard';
import { useOverlayInteractions } from './behavior/useOverlayInteractions';
import { useOverlayRender } from './behavior/useOverlayRender';
import './ShadowEditorOverlay.css';

const ShadowEditorOverlay = () => {
  const width = useGameFitStore((s) => s.width);
  const height = useGameFitStore((s) => s.height);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vpRef = useRef<Vp | null>(null);
  const mouseDisplayRef = useRef<Point | null>(null);
  const hoveredGizmoRef = useRef<GizmoPart | null>(null);
  const activeGizmoRef = useRef<GizmoPart | null>(null);
  const gizmoStartRef = useRef<GizmoStart | null>(null);
  const dragMovedRef = useRef<boolean>(false);

  const s = useShadowEditorStore();
  const refs = { canvasRef, vpRef, mouseDisplayRef, hoveredGizmoRef, activeGizmoRef, gizmoStartRef, dragMovedRef };

  useEnsureShadowProject();
  useOverlayKeyboard({ vpRef });

  const interactions = useOverlayInteractions(interactionDeps(s, refs, { width, height }));

  useOverlayRender({
    ...refs,
    width, height,
    selectedElementId: s.selectedElementId,
    freehandPoints: s.freehandPoints,
    isDrawingFreehand: s.isDrawingFreehand,
    project: s.project,
    getScreenData: s.getScreenData,
  });

  if (width === 0 || height === 0) return null;

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
