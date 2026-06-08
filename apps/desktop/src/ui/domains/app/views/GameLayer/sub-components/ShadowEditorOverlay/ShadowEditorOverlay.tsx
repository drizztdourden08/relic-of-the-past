/* @layer renderer-components @kind component */
import { useRef } from 'react';
import { Canvas } from '../../../../../../design-system/primitives/Canvas';
import { useShadowEditorStore } from '../../../../../../../stores/shadow-editor-store';
import type { GizmoPart } from '../shadow-editor/gizmos';
import type { Vp, Point } from './coords';
import type { GizmoStart, ShadowEditorOverlayProps } from './ShadowEditorOverlay.type';
import { useOverlayKeyboard } from './useOverlayKeyboard';
import { useOverlayInteractions } from './useOverlayInteractions';
import { useOverlayRender } from './useOverlayRender';

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

  const interactions = useOverlayInteractions({
    ...refs,
    width, height,
    activeTool: s.activeTool,
    selectedElementId: s.selectedElementId,
    isDragging: s.isDragging,
    dragStartWorld: s.dragStartWorld,
    isDrawingFreehand: s.isDrawingFreehand,
    freehandPoints: s.freehandPoints,
    polygonSides: s.polygonSides,
    polygonCornerRadius: s.polygonCornerRadius,
    defaultSmoothing: s.defaultSmoothing,
    defaultLightIntensity: s.defaultLightIntensity,
    defaultLightRadius: s.defaultLightRadius,
    getScreenData: s.getScreenData,
    addHeightmapElement: s.addHeightmapElement,
    addLight: s.addLight,
    setSelectedElement: s.setSelectedElement,
    updateHeightmapElement: s.updateHeightmapElement,
    updateLight: s.updateLight,
    getEffectiveHeight: s.getEffectiveHeight,
    addFreehandPoint: s.addFreehandPoint,
    clearFreehandPoints: s.clearFreehandPoints,
    setIsDrawingFreehand: s.setIsDrawingFreehand,
    setIsDragging: s.setIsDragging,
    setDragStartWorld: s.setDragStartWorld,
  });

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

  const interactive = !s.previewMode && (s.activeTool === 'select' || s.activeTool === 'polygon' || s.activeTool === 'freehand' || s.activeTool === 'point-light' || s.activeTool === 'shape-light');

  return (
    <Canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={interactions.handleMouseDown}
      onMouseMove={interactions.handleMouseMove}
      onMouseUp={interactions.handleMouseUp}
      onContextMenu={interactions.handleContextMenu}
      onDoubleClick={interactions.handleDoubleClick}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width,
        height,
        pointerEvents: interactive ? 'auto' : 'none',
        zIndex: 10,
        cursor: interactions.cursor,
      }}
    />
  );
};

export { ShadowEditorOverlay };
