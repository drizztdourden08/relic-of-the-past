/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { useShadowEditorStore } from '../../../../../../stores/shadow-editor-store';
import type { EditorTool } from '../../../../../../stores/shadow-editor-store';
import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { SegmentedControl } from '../../../../../design-system/primitives/SegmentedControl';
import { Slider } from '../../../../../design-system/primitives/Slider';
import { Button } from '../../../../../design-system/primitives/Button';
import { IconButton } from '../../../../../design-system/primitives/IconButton';
import { HeightLevelPicker } from './shadow-editor/HeightLevelPicker';
import { ShadowShapeInspector } from './shadow-editor/ShadowShapeInspector';
import { ShadowLightInspector } from './shadow-editor/ShadowLightInspector';
import { ShadowGlobalSettings } from './shadow-editor/ShadowGlobalSettings';
import { wasmGetViewportInfo } from '../../../../../../lib/game';
import './ShadowEditorPanel.css';

const TOOL_OPTIONS: { value: EditorTool; label: string }[] = [
  { value: 'select', label: '↖ Select' },
  { value: 'polygon', label: '⬡ Shape' },
  { value: 'freehand', label: '✏ Draw' },
  { value: 'point-light', label: '💡 Light' },
  { value: 'shape-light', label: '🔦 Area' },
];

const POLYGON_OPTIONS = [
  { value: '3', label: '△' },
  { value: '4', label: '◻' },
  { value: '5', label: '⬠' },
  { value: '6', label: '⬡' },
  { value: '8', label: '◯' },
];

const ShadowEditorPanel = () => {
  const store = useShadowEditorStore();
  const {
    open,
    activeTool,
    setActiveTool,
    previewMode,
    setPreviewMode,
    debugMode,
    setDebugMode,
    selectedElementId,
    selectedType,
    polygonSides,
    setPolygonSides,
    polygonCornerRadius,
    setPolygonCornerRadius,
    dirty,
    save,
    getScreenData,
    updateHeightmapElement,
    updateLight,
    updateLighting,
    removeHeightmapElement,
    removeLight,
    undo,
    redo,
  } = store;

  const getCurrentScreenId = useCallback((): number => {
    const vp = wasmGetViewportInfo();
    if (!vp) return 0;
    const col = Math.floor((vp.cameraX + 128) / 512) & 7;
    const row = Math.floor((vp.cameraY + 112) / 512) & 7;
    return row * 8 + col;
  }, []);

  const screenId = getCurrentScreenId();
  const screenData = getScreenData(screenId);

  const selectedHm = selectedType === 'heightmap' ? screenData.heightmap.find((e) => e.id === selectedElementId) : null;
  const selectedLight = selectedType === 'light' ? screenData.lights.find((l) => l.id === selectedElementId) : null;
  const hasSelection = selectedHm || selectedLight;

  const handleDelete = useCallback(() => {
    if (!selectedElementId) return;
    if (selectedType === 'heightmap') removeHeightmapElement(screenId, selectedElementId);
    if (selectedType === 'light') removeLight(screenId, selectedElementId);
  }, [selectedElementId, selectedType, screenId, removeHeightmapElement, removeLight]);

  if (!open) return null;

  const handleClose = () => useShadowEditorStore.getState().setOpen(false);

  return (
    <Box className="shadow-editor-panel">
      {/* ─── Header ─── */}
      <Box className="shadow-editor-panel__header">
        <Text className="shadow-editor-panel__title">
          Shadows
          {dirty && <Text className="shadow-editor-panel__dirty">●</Text>}
        </Text>
        <Box className="shadow-editor-panel__actions">
          <IconButton label="Preview" onClick={() => setPreviewMode(!previewMode)} className={previewMode ? 'icon-btn--active' : ''}>👁</IconButton>
          <IconButton label="Debug" onClick={() => setDebugMode(!debugMode)} className={debugMode ? 'icon-btn--active' : ''}>🔍</IconButton>
          <IconButton label="Undo" onClick={() => undo(screenId)}>↶</IconButton>
          <IconButton label="Redo" onClick={() => redo(screenId)}>↷</IconButton>
          <Button size="sm" variant="primary" onClick={() => save()} disabled={!dirty}>Save</Button>
          <IconButton label="Close" onClick={handleClose}>✕</IconButton>
        </Box>
      </Box>

      {/* ─── Toolbar ─── */}
      <Box className="shadow-editor-panel__toolbar">
        <SegmentedControl
          value={activeTool}
          options={TOOL_OPTIONS}
          onChange={(v) => setActiveTool(v as EditorTool)}
        />
      </Box>

      {/* ─── Shape Creation Options (shown when polygon/shape-light tool active) ─── */}
      {(activeTool === 'polygon' || activeTool === 'shape-light') && !hasSelection && (
        <Box className="shadow-editor-panel__tool-opts">
          <SegmentedControl
            value={String(polygonSides)}
            options={POLYGON_OPTIONS}
            onChange={(v) => setPolygonSides(Number(v))}
          />
          <Slider
            value={polygonCornerRadius}
            min={0}
            max={32}
            step={1}
            label="Corner Radius"
            onChange={setPolygonCornerRadius}
          />
          <Box className="shadow-editor-panel__subsection">
            <Text className="shadow-editor-panel__sublabel">Height</Text>
            <HeightLevelPicker
              value={store.getEffectiveHeight()}
              onChange={(v) => store.setCustomHeight(v)}
            />
          </Box>
        </Box>
      )}

      {/* ─── Light Creation Options ─── */}
      {(activeTool === 'point-light') && !hasSelection && (
        <Box className="shadow-editor-panel__tool-opts">
          <Slider
            value={store.defaultLightIntensity}
            min={0}
            max={2}
            step={0.05}
            label="Intensity"
            onChange={store.setDefaultLightIntensity}
            showValue
          />
          <Slider
            value={store.defaultLightRadius}
            min={8}
            max={256}
            step={4}
            label="Radius"
            onChange={store.setDefaultLightRadius}
            showValue
          />
        </Box>
      )}

      <Box className="shadow-editor-panel__body">
        {/* ─── Selected Shape Inspector ─── */}
        {selectedHm && (
          <ShadowShapeInspector screenId={screenId} selectedHm={selectedHm} updateHeightmapElement={updateHeightmapElement} handleDelete={handleDelete} />
        )}

        {/* ─── Selected Light Inspector ─── */}
        {selectedLight && (
          <ShadowLightInspector screenId={screenId} selectedLight={selectedLight} updateLight={updateLight} handleDelete={handleDelete} />
        )}

        {/* ─── Global Settings (only when nothing selected) ─── */}
        {!hasSelection && (
          <ShadowGlobalSettings screenId={screenId} screenData={screenData} updateLighting={updateLighting} />
        )}
      </Box>

      {/* ─── Footer ─── */}
      <Box className="shadow-editor-panel__footer">
        Screen #{screenId} · {screenData.heightmap.length} shapes · {screenData.lights.length} lights
      </Box>
    </Box>
  );
};

export { ShadowEditorPanel };
