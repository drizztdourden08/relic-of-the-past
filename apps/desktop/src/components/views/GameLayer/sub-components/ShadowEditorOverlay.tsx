/* @layer renderer-components @kind component */
import { useRef, useEffect, useCallback, useState } from 'react';
import { useShadowEditorStore } from '../../../../stores/shadow-editor-store';
import { wasmGetViewportInfo } from '../../../../lib/game';
import type { HeightmapElement, LightSource, ShapeDefinition } from '@shared/types/shadow-casting';
import { EMPTY_SHADOW_PROJECT } from '@shared/types/shadow-casting';
import { hitTestGizmo, renderGizmo, buildGizmoContext, getGizmoCursor } from './shadow-editor/gizmos';
import type { GizmoPart } from './shadow-editor/gizmos';

let nextId = 1;
const genId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${nextId++}`;
};

interface Props {
  width: number;
  height: number;
  gameRunning: boolean;
}

const ShadowEditorOverlay = ({ width, height, gameRunning }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const vpRef = useRef<ReturnType<typeof wasmGetViewportInfo>>(null);

  const {
    open,
    activeTool,
    previewMode,
    selectedElementId,
    freehandPoints,
    isDrawingFreehand,
    project,
    getScreenData,
    addHeightmapElement,
    addLight,
    setSelectedElement,
    updateHeightmapElement,
    updateLight,
    getEffectiveHeight,
    polygonSides,
    polygonCornerRadius,
    defaultSmoothing,
    defaultLightIntensity,
    defaultLightRadius,
    addFreehandPoint,
    clearFreehandPoints,
    setIsDrawingFreehand,
    isDragging,
    setIsDragging,
    dragStartWorld,
    setDragStartWorld,
  } = useShadowEditorStore();

  const { loadProject } = useShadowEditorStore();

  // ─── Gizmo & live-preview refs (high-frequency, no re-render) ───
  const mouseDisplayRef = useRef<{ x: number; y: number } | null>(null);
  const hoveredGizmoRef = useRef<GizmoPart | null>(null);
  const activeGizmoRef = useRef<GizmoPart | null>(null);
  const gizmoStartRef = useRef<{ x: number; y: number; width: number; height: number; rotation: number } | null>(null);
  const dragMovedRef = useRef<boolean>(false);
  const [cursor, setCursor] = useState<string>('default');

  // Load project when editor opens
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const project = await window.api.shadowCasting.load();
        loadProject(project ?? { ...EMPTY_SHADOW_PROJECT });
      } catch {
        loadProject({ ...EMPTY_SHADOW_PROJECT });
      }
    })();
  }, [open, loadProject]);

  // Keyboard shortcuts when editor is open
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      const store = useShadowEditorStore.getState();
      const screenId = (() => {
        const vp = vpRef.current;
        if (!vp) return -1;
        const col = Math.floor((vp.cameraX + 128) / 512) & 7;
        const row = Math.floor((vp.cameraY + 112) / 512) & 7;
        return row * 8 + col;
      })();
      if (screenId < 0) return;

      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        store.undo(screenId);
      } else if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
        e.preventDefault();
        store.redo(screenId);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (store.selectedElementId) {
          e.preventDefault();
          if (store.selectedType === 'heightmap') store.removeHeightmapElement(screenId, store.selectedElementId);
          else if (store.selectedType === 'light') store.removeLight(screenId, store.selectedElementId);
        }
      } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        store.save();
      } else if (e.key === 'Escape') {
        store.setActiveTool('select');
        store.setSelectedElement(null, null);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // Get current screen ID from viewport
  const getScreenId = useCallback((): number => {
    const vp = vpRef.current;
    if (!vp) return -1;
    // Use overworldScreenIndex which gives us the actual screen tile index
    // For overworld: computed from camera position
    const camX = vp.cameraX;
    const camY = vp.cameraY;
    const screenCol = Math.floor((camX + 128) / 512) & 7;
    const screenRow = Math.floor((camY + 112) / 512) & 7;
    return screenRow * 8 + screenCol;
  }, []);

  // Convert display pixel to world coordinate
  const displayToWorld = useCallback((displayX: number, displayY: number): { x: number; y: number } | null => {
    const vp = vpRef.current;
    if (!vp) return null;

    const snesW = vp.snesWidth;
    const snesH = vp.snesHeight;
    const scaleX = width / snesW;
    const scaleY = height / snesH;

    // Display px → SNES px
    const snesX = displayX / scaleX;
    const snesY = displayY / scaleY;

    // SNES px → World px
    const viewLeft = vp.cameraX - vp.extraLeftRight;
    const viewTop = vp.cameraY;
    const worldX = snesX + viewLeft;
    const worldY = snesY + viewTop;

    return { x: worldX, y: worldY };
  }, [width, height]);

  // Convert world coordinate to display pixel
  const worldToDisplay = useCallback((worldX: number, worldY: number): { x: number; y: number } | null => {
    const vp = vpRef.current;
    if (!vp) return null;

    const snesW = vp.snesWidth;
    const snesH = vp.snesHeight;
    const scaleX = width / snesW;
    const scaleY = height / snesH;

    const viewLeft = vp.cameraX - vp.extraLeftRight;
    const viewTop = vp.cameraY;
    const screenX = worldX - viewLeft;
    const screenY = worldY - viewTop;

    return { x: screenX * scaleX, y: screenY * scaleY };
  }, [width, height]);

  // ─── Mouse event → canvas-relative position ───
  const getCanvasPos = useCallback((e: React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  // ─── Hit test in world space ───
  const hitTest = useCallback((worldX: number, worldY: number, screenId: number): { id: string; type: 'heightmap' | 'light' } | null => {
    const screenData = getScreenData(screenId);

    // Check lights first (small hit area)
    for (let i = screenData.lights.length - 1; i >= 0; i--) {
      const light = screenData.lights[i];
      const dist = Math.sqrt((worldX - light.x) ** 2 + (worldY - light.y) ** 2);
      if (dist < 12) return { id: light.id, type: 'light' };
    }

    // Check heightmap elements
    for (let i = screenData.heightmap.length - 1; i >= 0; i--) {
      const el = screenData.heightmap[i];

      // For freehand shapes with points, do point-in-polygon test
      if (el.shape.type === 'freehand' && el.shape.points && el.shape.points.length >= 3) {
        const pts = el.shape.points;
        let inside = false;
        for (let j = 0, k = pts.length - 1; j < pts.length; k = j++) {
          const xi = pts[j].x, yi = pts[j].y;
          const xk = pts[k].x, yk = pts[k].y;
          if (((yi > worldY) !== (yk > worldY)) && (worldX < (xk - xi) * (worldY - yi) / (yk - yi) + xi)) {
            inside = !inside;
          }
        }
        if (inside) return { id: el.id, type: 'heightmap' };
        // Also check near edges (within 6px)
        for (let j = 0, k = pts.length - 1; j < pts.length; k = j++) {
          const dx = pts[j].x - pts[k].x, dy = pts[j].y - pts[k].y;
          const lenSq = dx * dx + dy * dy;
          if (lenSq === 0) continue;
          let t = ((worldX - pts[k].x) * dx + (worldY - pts[k].y) * dy) / lenSq;
          t = Math.max(0, Math.min(1, t));
          const cx = pts[k].x + t * dx, cy = pts[k].y + t * dy;
          if (Math.sqrt((worldX - cx) ** 2 + (worldY - cy) ** 2) < 6) {
            return { id: el.id, type: 'heightmap' };
          }
        }
      } else {
        // Bounding box test for regular polygons
        const dx = Math.abs(worldX - el.shape.x);
        const dy = Math.abs(worldY - el.shape.y);
        if (dx < el.shape.width / 2 + 4 && dy < el.shape.height / 2 + 4) {
          return { id: el.id, type: 'heightmap' };
        }
      }
    }
    return null;
  }, [getScreenData]);

  // ─── Mouse Down ───
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // left click only
    const displayPos = getCanvasPos(e);
    const worldPos = displayToWorld(displayPos.x, displayPos.y);
    if (!worldPos) return;
    const screenId = getScreenId();
    if (screenId < 0) return;

    if (activeTool === 'select') {
      // Check if clicking on a gizmo part first
      if (selectedElementId && hoveredGizmoRef.current) {
        const screenData = getScreenData(screenId);
        const store = useShadowEditorStore.getState();
        activeGizmoRef.current = hoveredGizmoRef.current;
        dragMovedRef.current = false;
        setIsDragging(true);
        setDragStartWorld(worldPos);

        // Store initial shape state for relative transforms
        if (store.selectedType === 'heightmap') {
          const el = screenData.heightmap.find((h) => h.id === selectedElementId);
          if (el) {
            gizmoStartRef.current = {
              x: el.shape.x, y: el.shape.y,
              width: el.shape.width, height: el.shape.height,
              rotation: el.shape.rotation ?? 0,
            };
          }
        } else if (store.selectedType === 'light') {
          const light = screenData.lights.find((l) => l.id === selectedElementId);
          if (light) {
            gizmoStartRef.current = { x: light.x, y: light.y, width: 0, height: 0, rotation: 0 };
          }
        }
        return;
      }

      const hit = hitTest(worldPos.x, worldPos.y, screenId);
      if (hit) {
        setSelectedElement(hit.id, hit.type);
        setIsDragging(true);
        setDragStartWorld(worldPos);
        dragMovedRef.current = false;
        // Store initial position for live drag
        const screenData = getScreenData(screenId);
        if (hit.type === 'heightmap') {
          const el = screenData.heightmap.find((h) => h.id === hit.id);
          if (el) gizmoStartRef.current = { x: el.shape.x, y: el.shape.y, width: el.shape.width, height: el.shape.height, rotation: el.shape.rotation ?? 0 };
        } else if (hit.type === 'light') {
          const light = screenData.lights.find((l) => l.id === hit.id);
          if (light) gizmoStartRef.current = { x: light.x, y: light.y, width: 0, height: 0, rotation: 0 };
        }
      } else {
        setSelectedElement(null, null);
      }
      return;
    }

    if (activeTool === 'polygon' || activeTool === 'shape-light') {
      setIsDragging(true);
      setDragStartWorld(worldPos);
      return;
    }

    if (activeTool === 'point-light') {
      const light: LightSource = {
        id: genId('light'),
        type: 'point',
        x: worldPos.x,
        y: worldPos.y,
        intensity: defaultLightIntensity,
        radius: defaultLightRadius,
        color: 'sample',
        castShadows: true,
      };
      addLight(screenId, light);
      return;
    }

    if (activeTool === 'freehand') {
      if (!isDrawingFreehand) {
        setIsDrawingFreehand(true);
        clearFreehandPoints();
      }
      addFreehandPoint(worldPos);
      return;
    }
  }, [activeTool, getCanvasPos, displayToWorld, getScreenId, hitTest, getScreenData, selectedElementId, setSelectedElement, setIsDragging, setDragStartWorld, addLight, defaultLightIntensity, defaultLightRadius, isDrawingFreehand, setIsDrawingFreehand, clearFreehandPoints, addFreehandPoint]);

  // ─── Mouse Up ───
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDragging && activeTool !== 'freehand') return;
    const displayPos = getCanvasPos(e);
    const worldPos = displayToWorld(displayPos.x, displayPos.y);
    if (!worldPos) { setIsDragging(false); return; }
    const screenId = getScreenId();
    if (screenId < 0) { setIsDragging(false); return; }

    if (activeTool === 'select' && isDragging && selectedElementId && dragStartWorld) {
      // Both gizmo drag and select-move are applied live in mousemove — just clean up
      activeGizmoRef.current = null;
      gizmoStartRef.current = null;
      setIsDragging(false);
      setDragStartWorld(null);
      return;
    }

    if ((activeTool === 'polygon' || activeTool === 'shape-light') && isDragging && dragStartWorld) {
      const w = Math.abs(worldPos.x - dragStartWorld.x);
      const h = Math.abs(worldPos.y - dragStartWorld.y);
      if (w >= 4 || h >= 4) {
        const cx = (worldPos.x + dragStartWorld.x) / 2;
        const cy = (worldPos.y + dragStartWorld.y) / 2;

        const shape: ShapeDefinition = {
          id: genId('shape'),
          type: 'polygon',
          sides: polygonSides,
          cornerRadius: polygonCornerRadius,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          x: cx,
          y: cy,
          width: w,
          height: h,
        };

        if (activeTool === 'polygon') {
          addHeightmapElement(screenId, {
            id: genId('hm'),
            shape,
            height: getEffectiveHeight(),
            smoothing: defaultSmoothing,
          });
        } else {
          addLight(screenId, {
            id: genId('light'),
            type: 'shape',
            x: cx,
            y: cy,
            intensity: defaultLightIntensity,
            radius: Math.max(w, h) / 2,
            color: 'sample',
            shape,
            castShadows: true,
          });
        }
      }
      setIsDragging(false);
      setDragStartWorld(null);
      return;
    }

    setIsDragging(false);
    setDragStartWorld(null);
  }, [isDragging, activeTool, selectedElementId, dragStartWorld, getCanvasPos, displayToWorld, getScreenId, getScreenData, updateHeightmapElement, updateLight, setIsDragging, setDragStartWorld, polygonSides, polygonCornerRadius, defaultSmoothing, defaultLightIntensity, defaultLightRadius, getEffectiveHeight, addHeightmapElement, addLight]);

  // ─── Double Click (finalize freehand) ───
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (activeTool !== 'freehand' || !isDrawingFreehand || freehandPoints.length < 3) return;
    const displayPos = getCanvasPos(e);
    const worldPos = displayToWorld(displayPos.x, displayPos.y);
    if (!worldPos) return;
    const screenId = getScreenId();
    if (screenId < 0) return;

    const allPoints = [...freehandPoints, worldPos];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of allPoints) {
      minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
    }

    const shape: ShapeDefinition = {
      id: genId('shape'),
      type: 'freehand',
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
      width: maxX - minX,
      height: maxY - minY,
      points: allPoints,
    };

    addHeightmapElement(screenId, {
      id: genId('hm'),
      shape,
      height: getEffectiveHeight(),
      smoothing: defaultSmoothing,
    });
    clearFreehandPoints();
    setIsDrawingFreehand(false);
  }, [activeTool, isDrawingFreehand, freehandPoints, getCanvasPos, displayToWorld, getScreenId, addHeightmapElement, getEffectiveHeight, defaultSmoothing, clearFreehandPoints, setIsDrawingFreehand]);

  // ─── Mouse Move (live preview + gizmo hover + drag) ───
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const displayPos = getCanvasPos(e);
    mouseDisplayRef.current = displayPos;
    const worldPos = displayToWorld(displayPos.x, displayPos.y);

    // During gizmo drag
    if (activeGizmoRef.current && isDragging && dragStartWorld && worldPos && selectedElementId) {
      const screenId = getScreenId();
      if (screenId < 0) return;
      const screenData = getScreenData(screenId);
      const store = useShadowEditorStore.getState();
      const gizmoStart = gizmoStartRef.current;
      if (!gizmoStart) return;

      const dx = worldPos.x - dragStartWorld.x;
      const dy = worldPos.y - dragStartWorld.y;

      // Track if we've actually moved (threshold of 2px world)
      if (!dragMovedRef.current && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
        dragMovedRef.current = true;
      }
      if (!dragMovedRef.current) return;

      if (store.selectedType === 'heightmap') {
        const el = screenData.heightmap.find((h) => h.id === selectedElementId);
        if (!el) return;

        switch (activeGizmoRef.current) {
          case 'move-center':
            updateHeightmapElement(screenId, el.id, {
              shape: { ...el.shape, x: gizmoStart.x + dx, y: gizmoStart.y + dy },
            });
            break;
          case 'move-x':
            updateHeightmapElement(screenId, el.id, {
              shape: { ...el.shape, x: gizmoStart.x + dx },
            });
            break;
          case 'move-y':
            updateHeightmapElement(screenId, el.id, {
              shape: { ...el.shape, y: gizmoStart.y + dy },
            });
            break;
          case 'resize-x':
            updateHeightmapElement(screenId, el.id, {
              shape: { ...el.shape, width: Math.max(4, gizmoStart.width + dx * 2) },
            });
            break;
          case 'resize-y':
            updateHeightmapElement(screenId, el.id, {
              shape: { ...el.shape, height: Math.max(4, gizmoStart.height - dy * 2) },
            });
            break;
          case 'resize-uniform': {
            const scale = 1 + ((-dx - dy) / 100);
            updateHeightmapElement(screenId, el.id, {
              shape: {
                ...el.shape,
                width: Math.max(4, gizmoStart.width * scale),
                height: Math.max(4, gizmoStart.height * scale),
              },
            });
            break;
          }
          case 'rotate': {
            const angle = Math.atan2(worldPos.y - el.shape.y, worldPos.x - el.shape.x);
            updateHeightmapElement(screenId, el.id, {
              shape: { ...el.shape, rotation: (angle * 180 / Math.PI + 360) % 360 },
            });
            break;
          }
          default: {
            // Handle vertex-N dragging
            const vertexMatch = activeGizmoRef.current.match(/^vertex-(\d+)$/);
            if (vertexMatch) {
              const vertexIdx = parseInt(vertexMatch[1], 10);
              // If this is a regular polygon (no points array), convert to freehand first
              if (el.shape.type === 'polygon' && !el.shape.points) {
                const sides = el.shape.sides ?? 4;
                const startAngle = -Math.PI / 2 + (sides % 2 === 0 ? Math.PI / sides : 0);
                const hw = el.shape.width / 2;
                const hh = el.shape.height / 2;
                const rot = (el.shape.rotation ?? 0) * Math.PI / 180;
                const pts: { x: number; y: number }[] = [];
                for (let i = 0; i < sides; i++) {
                  const a = (i / sides) * Math.PI * 2 + startAngle;
                  const lx = Math.cos(a) * hw;
                  const ly = Math.sin(a) * hh;
                  // Rotate and translate to world
                  const rx = lx * Math.cos(rot) - ly * Math.sin(rot);
                  const ry = lx * Math.sin(rot) + ly * Math.cos(rot);
                  pts.push({ x: el.shape.x + rx, y: el.shape.y + ry });
                }
                // Move the dragged vertex
                if (vertexIdx < pts.length) {
                  pts[vertexIdx] = { x: worldPos.x, y: worldPos.y };
                }
                // Recompute bounds
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                for (const p of pts) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); }
                updateHeightmapElement(screenId, el.id, {
                  shape: {
                    ...el.shape,
                    type: 'freehand',
                    x: (minX + maxX) / 2,
                    y: (minY + maxY) / 2,
                    width: maxX - minX,
                    height: maxY - minY,
                    points: pts,
                    rotation: 0,
                    sides: undefined,
                  },
                });
              } else if (el.shape.points) {
                // Already freehand — just move the vertex
                const pts = [...el.shape.points];
                if (vertexIdx < pts.length) {
                  pts[vertexIdx] = { x: worldPos.x, y: worldPos.y };
                  // Recompute bounds
                  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                  for (const p of pts) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); }
                  updateHeightmapElement(screenId, el.id, {
                    shape: {
                      ...el.shape,
                      x: (minX + maxX) / 2,
                      y: (minY + maxY) / 2,
                      width: maxX - minX,
                      height: maxY - minY,
                      points: pts,
                    },
                  });
                }
              }
            }
            break;
          }
        }
      } else if (store.selectedType === 'light') {
        const light = screenData.lights.find((l) => l.id === selectedElementId);
        if (light && (activeGizmoRef.current === 'move-center' || activeGizmoRef.current === 'move-x' || activeGizmoRef.current === 'move-y')) {
          const nx = activeGizmoRef.current === 'move-y' ? light.x : gizmoStart.x + dx;
          const ny = activeGizmoRef.current === 'move-x' ? light.y : gizmoStart.y + dy;
          updateLight(screenId, light.id, { x: nx, y: ny });
        }
      }
      return;
    }

    // During select-drag (move element) — live update
    if (activeTool === 'select' && isDragging && dragStartWorld && worldPos && selectedElementId && !activeGizmoRef.current) {
      const screenId = getScreenId();
      if (screenId < 0) return;
      const store = useShadowEditorStore.getState();
      const gizmoStart = gizmoStartRef.current;
      if (!gizmoStart) return;
      const dx = worldPos.x - dragStartWorld.x;
      const dy = worldPos.y - dragStartWorld.y;
      if (store.selectedType === 'heightmap') {
        updateHeightmapElement(screenId, selectedElementId, {
          shape: { ...store.getScreenData(screenId).heightmap.find((h) => h.id === selectedElementId)!.shape, x: gizmoStart.x + dx, y: gizmoStart.y + dy },
        });
      } else if (store.selectedType === 'light') {
        updateLight(screenId, selectedElementId, { x: gizmoStart.x + dx, y: gizmoStart.y + dy });
      }
      return;
    }

    // During polygon/shape-light drag — just store position (preview drawn in render loop)
    if ((activeTool === 'polygon' || activeTool === 'shape-light') && isDragging) {
      return;
    }

    // Gizmo hover detection (only when select tool + something selected)
    if (activeTool === 'select' && selectedElementId && !isDragging) {
      const screenId = getScreenId();
      if (screenId < 0) return;
      const screenData = getScreenData(screenId);
      const store = useShadowEditorStore.getState();

      let newCursor = 'default';

      if (store.selectedType === 'heightmap') {
        const el = screenData.heightmap.find((h) => h.id === selectedElementId);
        if (el) {
          const vp = vpRef.current;
          if (vp) {
            const snesW = vp.snesWidth;
            const snesH = vp.snesHeight;
            const scaleX = width / snesW;
            const scaleY = height / snesH;

            const gizmoCtx = buildGizmoContext(
              el.shape.x, el.shape.y,
              el.shape.width, el.shape.height,
              el.shape.rotation ?? 0,
              scaleX, scaleY,
              worldToDisplay,
              el.shape.points,
              el.shape.sides,
            );
            if (gizmoCtx) {
              const hit = hitTestGizmo(displayPos.x, displayPos.y, gizmoCtx);
              hoveredGizmoRef.current = hit?.part ?? null;
              if (hit) newCursor = hit.cursor;
            } else {
              hoveredGizmoRef.current = null;
            }
          }
        }
      } else if (store.selectedType === 'light') {
        // Simple hover for lights (center only)
        const light = screenData.lights.find((l) => l.id === selectedElementId);
        if (light) {
          const dp = worldToDisplay(light.x, light.y);
          if (dp && (displayPos.x - dp.x) ** 2 + (displayPos.y - dp.y) ** 2 < 100) {
            hoveredGizmoRef.current = 'move-center';
            newCursor = 'move';
          } else {
            hoveredGizmoRef.current = null;
          }
        }
      }

      setCursor(newCursor);
    } else if (activeTool !== 'select') {
      hoveredGizmoRef.current = null;
      setCursor('crosshair');
    }
  }, [activeTool, isDragging, dragStartWorld, selectedElementId, getCanvasPos, displayToWorld, getScreenId, getScreenData, worldToDisplay, updateHeightmapElement, updateLight, width, height]);

  // ─── Right-click cancel ───
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const store = useShadowEditorStore.getState();

    // Cancel any active drag — revert to initial position
    if (isDragging || activeGizmoRef.current) {
      const screenId = getScreenId();
      const gizmoStart = gizmoStartRef.current;

      // Revert position if we have a start state
      if (gizmoStart && selectedElementId && screenId >= 0) {
        if (store.selectedType === 'heightmap') {
          const el = store.getScreenData(screenId).heightmap.find((h) => h.id === selectedElementId);
          if (el) {
            updateHeightmapElement(screenId, selectedElementId, {
              shape: { ...el.shape, x: gizmoStart.x, y: gizmoStart.y, width: gizmoStart.width, height: gizmoStart.height, rotation: gizmoStart.rotation },
            });
          }
        } else if (store.selectedType === 'light') {
          updateLight(screenId, selectedElementId, { x: gizmoStart.x, y: gizmoStart.y });
        }
      }

      activeGizmoRef.current = null;
      gizmoStartRef.current = null;
      setIsDragging(false);
      setDragStartWorld(null);
      return;
    }

    // Cancel freehand drawing
    if (isDrawingFreehand) {
      clearFreehandPoints();
      setIsDrawingFreehand(false);
      return;
    }
  }, [isDragging, isDrawingFreehand, selectedElementId, getScreenId, updateHeightmapElement, updateLight, setIsDragging, setDragStartWorld, clearFreehandPoints, setIsDrawingFreehand]);

  // ─── Render loop (draws elements in world-space) ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !open || !gameRunning) {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const vp = wasmGetViewportInfo();
      vpRef.current = vp;
      ctx.clearRect(0, 0, width, height);

      if (!vp || vp.locationModule !== 9) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const snesW = vp.snesWidth;
      const snesH = vp.snesHeight;
      const scaleX = width / snesW;
      const scaleY = height / snesH;
      const viewLeft = vp.cameraX - vp.extraLeftRight;
      const viewTop = vp.cameraY;

      const screenId = Math.floor((vp.cameraX + 128) / 512) & 7;
      const screenRow = Math.floor((vp.cameraY + 112) / 512) & 7;
      const currentScreen = screenRow * 8 + screenId;
      const screenData = getScreenData(currentScreen);

      // In preview mode, skip all overlay drawing (just show shadow result)
      if (useShadowEditorStore.getState().previewMode) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      // Draw heightmap elements
      ctx.globalAlpha = 0.5;
      for (const el of screenData.heightmap) {
        const dp = worldToDisplay(el.shape.x, el.shape.y);
        if (!dp) continue;

        const isSelected = el.id === selectedElementId;
        ctx.save();
        ctx.translate(dp.x, dp.y);
        ctx.rotate((el.shape.rotation ?? 0) * Math.PI / 180);

        const hw = (el.shape.width / 2) * scaleX;
        const hh = (el.shape.height / 2) * scaleY;

        // Color by height
        const hue = 200 + el.height * 60;
        ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${0.2 + el.height * 0.3})`;
        ctx.strokeStyle = isSelected ? '#ffcc00' : `hsla(${hue}, 80%, 60%, 0.8)`;
        ctx.lineWidth = isSelected ? 2.5 : 1.5;

        if (el.shape.type === 'freehand' && el.shape.points) {
          ctx.beginPath();
          for (let i = 0; i < el.shape.points.length; i++) {
            const pp = worldToDisplay(el.shape.points[i].x, el.shape.points[i].y);
            if (!pp) continue;
            // Use absolute coords since we're translating to center
            const rx = pp.x - dp.x;
            const ry = pp.y - dp.y;
            if (i === 0) ctx.moveTo(rx, ry);
            else ctx.lineTo(rx, ry);
          }
          ctx.closePath();
        } else {
          const sides = el.shape.sides ?? 4;
          const startAngle = -Math.PI / 2 + (sides % 2 === 0 ? Math.PI / sides : 0);
          ctx.beginPath();
          for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2 + startAngle;
            const x = Math.cos(angle) * hw;
            const y = Math.sin(angle) * hh;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
        }

        ctx.fill();
        ctx.stroke();

        // Draw height label
        if (isSelected) {
          ctx.fillStyle = '#fff';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`h=${el.height.toFixed(2)}`, 0, -hh - 4);
        }

        ctx.restore();
      }

      // Draw lights
      ctx.globalAlpha = 0.8;
      for (const light of screenData.lights) {
        const dp = worldToDisplay(light.x, light.y);
        if (!dp) continue;

        const isSelected = light.id === selectedElementId;
        const radiusDisplay = light.radius * scaleX;

        // Radius ring
        ctx.beginPath();
        ctx.arc(dp.x, dp.y, radiusDisplay, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected ? 'rgba(255, 204, 0, 0.5)' : 'rgba(255, 238, 136, 0.2)';
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Center dot
        ctx.beginPath();
        ctx.arc(dp.x, dp.y, isSelected ? 7 : 5, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#ffcc00' : '#ffee88';
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#ff8800' : '#aa8844';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (isSelected) {
          ctx.fillStyle = '#fff';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${light.type} i=${light.intensity.toFixed(1)}`, dp.x, dp.y - 12);
        }
      }

      // Draw freehand in progress
      if (isDrawingFreehand && freehandPoints.length > 0) {
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        for (let i = 0; i < freehandPoints.length; i++) {
          const dp = worldToDisplay(freehandPoints[i].x, freehandPoints[i].y);
          if (!dp) continue;
          if (i === 0) ctx.moveTo(dp.x, dp.y);
          else ctx.lineTo(dp.x, dp.y);
        }
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        for (const p of freehandPoints) {
          const dp = worldToDisplay(p.x, p.y);
          if (!dp) continue;
          ctx.beginPath();
          ctx.arc(dp.x, dp.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#00ff88';
          ctx.fill();
        }
      }

      // ─── Live preview during polygon/shape-light drag ───
      const store = useShadowEditorStore.getState();
      if ((store.activeTool === 'polygon' || store.activeTool === 'shape-light') && store.isDragging && store.dragStartWorld && mouseDisplayRef.current) {
        const dragWorld = displayToWorld(mouseDisplayRef.current.x, mouseDisplayRef.current.y);
        if (dragWorld) {
          const startDP = worldToDisplay(store.dragStartWorld.x, store.dragStartWorld.y);
          const endDP = mouseDisplayRef.current;
          if (startDP) {
            const cx = (startDP.x + endDP.x) / 2;
            const cy = (startDP.y + endDP.y) / 2;
            const hw = Math.abs(endDP.x - startDP.x) / 2;
            const hh = Math.abs(endDP.y - startDP.y) / 2;

            if (hw > 2 || hh > 2) {
              ctx.save();
              ctx.globalAlpha = 0.4;
              ctx.translate(cx, cy);

              const sides = store.polygonSides;
              const startAngle = -Math.PI / 2 + (sides % 2 === 0 ? Math.PI / sides : 0);
              ctx.beginPath();
              for (let i = 0; i < sides; i++) {
                const angle = (i / sides) * Math.PI * 2 + startAngle;
                const x = Math.cos(angle) * hw;
                const y = Math.sin(angle) * hh;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              }
              ctx.closePath();

              const isLight = store.activeTool === 'shape-light';
              ctx.fillStyle = isLight ? 'rgba(255, 238, 136, 0.25)' : 'hsla(230, 70%, 50%, 0.3)';
              ctx.fill();
              ctx.strokeStyle = isLight ? '#ffee88' : '#6688ff';
              ctx.lineWidth = 2;
              ctx.setLineDash([6, 4]);
              ctx.stroke();
              ctx.setLineDash([]);

              // Dimension label
              ctx.fillStyle = '#fff';
              ctx.font = '10px monospace';
              ctx.textAlign = 'center';
              const wWorld = Math.abs(dragWorld.x - store.dragStartWorld.x);
              const hWorld = Math.abs(dragWorld.y - store.dragStartWorld.y);
              ctx.fillText(`${Math.round(wWorld)} × ${Math.round(hWorld)}`, 0, -hh - 8);

              ctx.restore();
            }
          }
        }
      }

      // ─── Draw gizmo for selected element ───
      if (store.activeTool === 'select' && store.selectedElementId) {
        const sd = getScreenData(currentScreen);
        if (store.selectedType === 'heightmap') {
          const el = sd.heightmap.find((h) => h.id === store.selectedElementId);
          if (el) {
            const gizmoCtx = buildGizmoContext(
              el.shape.x, el.shape.y,
              el.shape.width, el.shape.height,
              el.shape.rotation ?? 0,
              scaleX, scaleY,
              worldToDisplay,
              el.shape.points,
              el.shape.sides,
            );
            if (gizmoCtx) {
              ctx.globalAlpha = 1.0;
              renderGizmo(ctx, gizmoCtx, hoveredGizmoRef.current, activeGizmoRef.current);
            }
          }
        }
      }

      ctx.globalAlpha = 1.0;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [open, gameRunning, width, height, selectedElementId, freehandPoints, isDrawingFreehand, project, getScreenData, worldToDisplay]);

  if (!open || !gameRunning) return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width,
        height,
        pointerEvents: !previewMode && (activeTool === 'select' || activeTool === 'polygon' || activeTool === 'freehand' || activeTool === 'point-light' || activeTool === 'shape-light') ? 'auto' : 'none',
        zIndex: 10,
        cursor,
      }}
    />
  );
};

export { ShadowEditorOverlay };
