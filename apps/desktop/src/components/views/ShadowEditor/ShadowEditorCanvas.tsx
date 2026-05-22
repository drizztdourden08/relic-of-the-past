import { useRef, useEffect, useCallback } from 'react';
import { useEditorState } from './hooks/useEditorState';
import type { HeightmapElement, LightSource, ShapeDefinition } from '@shared/types/shadow-casting';

let nextId = 1;
function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${nextId++}`;
}

interface ShadowEditorCanvasProps {
  width: number;
  height: number;
}

const ShadowEditorCanvas = (props: ShadowEditorCanvasProps) => {
  const { width, height } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; dragging: boolean }>({ startX: 0, startY: 0, dragging: false });

  const {
    activeTool,
    getCurrentScreenData,
    addHeightmapElement,
    addLight,
    setSelectedElement,
    selectedElementId,
    selectedType,
    updateHeightmapElement,
    updateLight,
    polygonSides,
    polygonCornerRadius,
    defaultHeight,
    defaultSmoothing,
    defaultLightIntensity,
    defaultLightRadius,
    freehandPoints,
    addFreehandPoint,
    clearFreehandPoints,
    isDrawingFreehand,
    setIsDrawingFreehand,
  } = useEditorState();

  const screenData = getCurrentScreenData();

  // Convert mouse event to canvas-local coordinates
  const getCanvasPos = useCallback((e: React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = 512 / rect.width;
    const scaleY = 448 / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  // Hit-test: find element at position
  const hitTest = useCallback((x: number, y: number): { id: string; type: 'heightmap' | 'light' } | null => {
    // Check lights first (on top)
    for (let i = screenData.lights.length - 1; i >= 0; i--) {
      const light = screenData.lights[i];
      const dist = Math.sqrt((x - light.x) ** 2 + (y - light.y) ** 2);
      if (dist < 12) return { id: light.id, type: 'light' };
    }
    // Check heightmap elements
    for (let i = screenData.heightmap.length - 1; i >= 0; i--) {
      const el = screenData.heightmap[i];
      const dx = Math.abs(x - el.shape.x);
      const dy = Math.abs(y - el.shape.y);
      if (dx < el.shape.width / 2 && dy < el.shape.height / 2) {
        return { id: el.id, type: 'heightmap' };
      }
    }
    return null;
  }, [screenData]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const pos = getCanvasPos(e);

    if (activeTool === 'select') {
      const hit = hitTest(pos.x, pos.y);
      if (hit) {
        setSelectedElement(hit.id, hit.type);
        dragRef.current = { startX: pos.x, startY: pos.y, dragging: true };
      } else {
        setSelectedElement(null, null);
      }
      return;
    }

    if (activeTool === 'polygon' || activeTool === 'shape-light') {
      dragRef.current = { startX: pos.x, startY: pos.y, dragging: true };
      return;
    }

    if (activeTool === 'point-light') {
      const light: LightSource = {
        id: genId('light'),
        type: 'point',
        x: pos.x,
        y: pos.y,
        intensity: defaultLightIntensity,
        radius: defaultLightRadius,
        color: 'sample',
        castShadows: true,
      };
      addLight(light);
      return;
    }

    if (activeTool === 'freehand') {
      if (!isDrawingFreehand) {
        setIsDrawingFreehand(true);
        clearFreehandPoints();
      }
      addFreehandPoint(pos);
      return;
    }
  }, [activeTool, getCanvasPos, hitTest, setSelectedElement, addLight, defaultLightIntensity, defaultLightRadius, isDrawingFreehand, setIsDrawingFreehand, clearFreehandPoints, addFreehandPoint]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const pos = getCanvasPos(e);

    if (activeTool === 'select' && dragRef.current.dragging && selectedElementId) {
      const dx = pos.x - dragRef.current.startX;
      const dy = pos.y - dragRef.current.startY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        if (selectedType === 'heightmap') {
          const el = screenData.heightmap.find((e) => e.id === selectedElementId);
          if (el) updateHeightmapElement(el.id, { shape: { ...el.shape, x: el.shape.x + dx, y: el.shape.y + dy } });
        } else if (selectedType === 'light') {
          const light = screenData.lights.find((l) => l.id === selectedElementId);
          if (light) updateLight(light.id, { x: light.x + dx, y: light.y + dy });
        }
      }
      dragRef.current.dragging = false;
      return;
    }

    if ((activeTool === 'polygon' || activeTool === 'shape-light') && dragRef.current.dragging) {
      const w = Math.abs(pos.x - dragRef.current.startX);
      const h = Math.abs(pos.y - dragRef.current.startY);
      if (w < 4 && h < 4) {
        dragRef.current.dragging = false;
        return;
      }

      const cx = (pos.x + dragRef.current.startX) / 2;
      const cy = (pos.y + dragRef.current.startY) / 2;

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
        const element: HeightmapElement = {
          id: genId('hm'),
          shape,
          height: defaultHeight,
          smoothing: defaultSmoothing,
        };
        addHeightmapElement(element);
      } else {
        const light: LightSource = {
          id: genId('light'),
          type: 'shape',
          x: cx,
          y: cy,
          intensity: defaultLightIntensity,
          radius: Math.max(w, h) / 2,
          color: 'sample',
          shape,
          castShadows: true,
        };
        addLight(light);
      }
      dragRef.current.dragging = false;
      return;
    }
  }, [activeTool, getCanvasPos, selectedElementId, selectedType, screenData, updateHeightmapElement, updateLight, addHeightmapElement, addLight, polygonSides, polygonCornerRadius, defaultHeight, defaultSmoothing, defaultLightIntensity, defaultLightRadius]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if (activeTool === 'freehand' && isDrawingFreehand && freehandPoints.length >= 3) {
      const pos = getCanvasPos(e);
      // Finalize the freehand shape
      const allPoints = [...freehandPoints, pos];

      // Compute bounding box
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const p of allPoints) {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
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

      const element: HeightmapElement = {
        id: genId('hm'),
        shape,
        height: defaultHeight,
        smoothing: defaultSmoothing,
      };
      addHeightmapElement(element);
      clearFreehandPoints();
      setIsDrawingFreehand(false);
    }
  }, [activeTool, isDrawingFreehand, freehandPoints, getCanvasPos, addHeightmapElement, defaultHeight, defaultSmoothing, clearFreehandPoints, setIsDrawingFreehand]);

  // ─── Render canvas overlay (draw shapes, lights, guides) ───
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 512, 448);

    // Draw heightmap elements
    for (const el of screenData.heightmap) {
      ctx.save();
      ctx.translate(el.shape.x, el.shape.y);
      ctx.rotate((el.shape.rotation ?? 0) * Math.PI / 180);
      ctx.scale(el.shape.scaleX ?? 1, el.shape.scaleY ?? 1);

      const isSelected = el.id === selectedElementId;
      ctx.strokeStyle = isSelected ? '#ffcc00' : 'rgba(100, 200, 255, 0.7)';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.fillStyle = `rgba(100, 200, 255, ${el.height * 0.3})`;

      if (el.shape.type === 'freehand' && el.shape.points) {
        ctx.beginPath();
        const pts = el.shape.points;
        ctx.moveTo(pts[0].x - el.shape.x, pts[0].y - el.shape.y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x - el.shape.x, pts[i].y - el.shape.y);
        }
        ctx.closePath();
      } else {
        // Polygon approximation
        const sides = el.shape.sides ?? 4;
        const halfW = el.shape.width / 2;
        const halfH = el.shape.height / 2;
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
          const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * halfW;
          const y = Math.sin(angle) * halfH;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
      }

      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Draw lights
    for (const light of screenData.lights) {
      const isSelected = light.id === selectedElementId;

      ctx.save();
      ctx.beginPath();
      ctx.arc(light.x, light.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#ffcc00' : '#ffee88';
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#ff8800' : '#aa8844';
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.stroke();

      // Draw radius circle
      ctx.beginPath();
      ctx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 238, 136, ${isSelected ? 0.5 : 0.2})`;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Draw freehand points in progress
    if (isDrawingFreehand && freehandPoints.length > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(freehandPoints[0].x, freehandPoints[0].y);
      for (let i = 1; i < freehandPoints.length; i++) {
        ctx.lineTo(freehandPoints[i].x, freehandPoints[i].y);
      }
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw vertices
      for (const p of freehandPoints) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#00ff88';
        ctx.fill();
      }
      ctx.restore();
    }
  }, [screenData, selectedElementId, freehandPoints, isDrawingFreehand]);

  return (
    <canvas
      ref={canvasRef}
      className="shadow-editor__canvas"
      width={512}
      height={448}
      style={{ width: `${width}px`, height: `${height}px` }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    />
  );
};

export { ShadowEditorCanvas };
