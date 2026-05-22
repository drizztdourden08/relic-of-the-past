import { useRef, useEffect, useCallback } from 'react';
import { useShadowEditorStore } from '../../../../stores/shadow-editor-store';
import { wasmGetViewportInfo } from '../../../../lib/game';
import type { HeightmapElement, LightSource, ShapeDefinition } from '@shared/types/shadow-casting';
import { EMPTY_SHADOW_PROJECT } from '@shared/types/shadow-casting';

let nextId = 1;
function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${nextId++}`;
}

interface Props {
  width: number;
  height: number;
  gameRunning: boolean;
}

/**
 * World-space canvas overlay for the shadow editor.
 * Uses the same viewport projection as ConnectionOverlay — game controls move the camera,
 * and all elements are positioned in world coordinates.
 */
function ShadowEditorOverlay({ width, height, gameRunning }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const vpRef = useRef<ReturnType<typeof wasmGetViewportInfo>>(null);

  const {
    open,
    activeTool,
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

    // Check heightmap elements (bounding box)
    for (let i = screenData.heightmap.length - 1; i >= 0; i--) {
      const el = screenData.heightmap[i];
      const dx = Math.abs(worldX - el.shape.x);
      const dy = Math.abs(worldY - el.shape.y);
      if (dx < el.shape.width / 2 + 4 && dy < el.shape.height / 2 + 4) {
        return { id: el.id, type: 'heightmap' };
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
      const hit = hitTest(worldPos.x, worldPos.y, screenId);
      if (hit) {
        setSelectedElement(hit.id, hit.type);
        setIsDragging(true);
        setDragStartWorld(worldPos);
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
  }, [activeTool, getCanvasPos, displayToWorld, getScreenId, hitTest, setSelectedElement, setIsDragging, setDragStartWorld, addLight, defaultLightIntensity, defaultLightRadius, isDrawingFreehand, setIsDrawingFreehand, clearFreehandPoints, addFreehandPoint]);

  // ─── Mouse Up ───
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDragging && activeTool !== 'freehand') return;
    const displayPos = getCanvasPos(e);
    const worldPos = displayToWorld(displayPos.x, displayPos.y);
    if (!worldPos) { setIsDragging(false); return; }
    const screenId = getScreenId();
    if (screenId < 0) { setIsDragging(false); return; }

    if (activeTool === 'select' && isDragging && selectedElementId && dragStartWorld) {
      const dx = worldPos.x - dragStartWorld.x;
      const dy = worldPos.y - dragStartWorld.y;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        const screenData = getScreenData(screenId);
        const selectedType = useShadowEditorStore.getState().selectedType;
        if (selectedType === 'heightmap') {
          const el = screenData.heightmap.find((e) => e.id === selectedElementId);
          if (el) updateHeightmapElement(screenId, el.id, { shape: { ...el.shape, x: el.shape.x + dx, y: el.shape.y + dy } });
        } else if (selectedType === 'light') {
          const light = screenData.lights.find((l) => l.id === selectedElementId);
          if (light) updateLight(screenId, light.id, { x: light.x + dx, y: light.y + dy });
        }
      }
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
          ctx.beginPath();
          for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
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
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width,
        height,
        pointerEvents: activeTool === 'select' || activeTool === 'polygon' || activeTool === 'freehand' || activeTool === 'point-light' || activeTool === 'shape-light' ? 'auto' : 'none',
        zIndex: 10,
        cursor: activeTool === 'select' ? 'default' : 'crosshair',
      }}
    />
  );
}

export { ShadowEditorOverlay };
