/* @layer renderer-components @kind logic */
import type { InteractionRefs, InteractionSize } from './interaction-deps.type';
import type { InteractionDeps } from './overlay.type';
import type { ShadowEditorState } from './store-state.type';

const interactionDeps = (s: ShadowEditorState, refs: InteractionRefs, size: InteractionSize): InteractionDeps => ({
  ...refs,
  ...size,
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

export { interactionDeps };
