import { useCallback } from 'react';
import { useShadowEditorStore } from '../../../../stores/shadow-editor-store';
import type { EditorTool } from '../../../../stores/shadow-editor-store';
import { SegmentedControl } from '../../../primitives/SegmentedControl';
import { Slider } from '../../../primitives/Slider';
import { Toggle } from '../../../primitives/Toggle';
import { Button } from '../../../primitives/Button';
import { IconButton } from '../../../primitives/IconButton';
import { SettingsSection } from '../../../composites/SettingsSection';
import { NumberField } from './shadow-editor/NumberField';
import { HeightLevelPicker } from './shadow-editor/HeightLevelPicker';
import { HeightLevelEditor } from './shadow-editor/HeightLevelEditor';
import { wasmGetViewportInfo } from '../../../../lib/game';
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

function ShadowEditorPanel() {
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
    <div className="shadow-editor-panel">
      {/* ─── Header ─── */}
      <div className="shadow-editor-panel__header">
        <span className="shadow-editor-panel__title">
          Shadows
          {dirty && <span className="shadow-editor-panel__dirty">●</span>}
        </span>
        <div className="shadow-editor-panel__actions">
          <IconButton label="Preview" onClick={() => setPreviewMode(!previewMode)} className={previewMode ? 'icon-btn--active' : ''}>👁</IconButton>
          <IconButton label="Debug" onClick={() => setDebugMode(!debugMode)} className={debugMode ? 'icon-btn--active' : ''}>🔍</IconButton>
          <IconButton label="Undo" onClick={() => undo(screenId)}>↶</IconButton>
          <IconButton label="Redo" onClick={() => redo(screenId)}>↷</IconButton>
          <Button size="sm" variant="primary" onClick={() => save()} disabled={!dirty}>Save</Button>
          <IconButton label="Close" onClick={handleClose}>✕</IconButton>
        </div>
      </div>

      {/* ─── Toolbar ─── */}
      <div className="shadow-editor-panel__toolbar">
        <SegmentedControl
          value={activeTool}
          options={TOOL_OPTIONS}
          onChange={(v) => setActiveTool(v as EditorTool)}
        />
      </div>

      {/* ─── Shape Creation Options (shown when polygon/shape-light tool active) ─── */}
      {(activeTool === 'polygon' || activeTool === 'shape-light') && !hasSelection && (
        <div className="shadow-editor-panel__tool-opts">
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
          <div className="shadow-editor-panel__subsection">
            <span className="shadow-editor-panel__sublabel">Height</span>
            <HeightLevelPicker
              value={store.getEffectiveHeight()}
              onChange={(v) => store.setCustomHeight(v)}
            />
          </div>
        </div>
      )}

      {/* ─── Light Creation Options ─── */}
      {(activeTool === 'point-light') && !hasSelection && (
        <div className="shadow-editor-panel__tool-opts">
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
        </div>
      )}

      <div className="shadow-editor-panel__body">
        {/* ─── Selected Shape Inspector ─── */}
        {selectedHm && (
          <SettingsSection title="Shape">
            {/* Position */}
            <div className="shadow-editor-panel__field-row">
              <NumberField icon="X" value={selectedHm.shape.x} step={1} onChange={(v) => updateHeightmapElement(screenId, selectedHm.id, { shape: { ...selectedHm.shape, x: v } })} />
              <NumberField icon="Y" value={selectedHm.shape.y} step={1} onChange={(v) => updateHeightmapElement(screenId, selectedHm.id, { shape: { ...selectedHm.shape, y: v } })} />
            </div>

            {/* Size */}
            <div className="shadow-editor-panel__field-row">
              <NumberField icon="W" value={selectedHm.shape.width} step={1} min={1} onChange={(v) => updateHeightmapElement(screenId, selectedHm.id, { shape: { ...selectedHm.shape, width: v } })} />
              <NumberField icon="H" value={selectedHm.shape.height} step={1} min={1} onChange={(v) => updateHeightmapElement(screenId, selectedHm.id, { shape: { ...selectedHm.shape, height: v } })} />
            </div>

            {/* Rotation */}
            <NumberField icon="⟳" value={selectedHm.shape.rotation ?? 0} step={1} min={0} max={360} suffix="°" onChange={(v) => updateHeightmapElement(screenId, selectedHm.id, { shape: { ...selectedHm.shape, rotation: v } })} />

            {/* Sides & Corner Radius (for polygons) */}
            {selectedHm.shape.type === 'polygon' && (
              <div className="shadow-editor-panel__field-row">
                <NumberField icon="◇" value={selectedHm.shape.sides ?? 4} step={1} min={3} max={64} onChange={(v) => updateHeightmapElement(screenId, selectedHm.id, { shape: { ...selectedHm.shape, sides: v } })} />
                <NumberField icon="⌒" value={selectedHm.shape.cornerRadius ?? 0} step={1} min={0} max={32} onChange={(v) => updateHeightmapElement(screenId, selectedHm.id, { shape: { ...selectedHm.shape, cornerRadius: v } })} />
              </div>
            )}

            {/* Height Level */}
            <div className="shadow-editor-panel__subsection">
              <span className="shadow-editor-panel__sublabel">Height</span>
              <HeightLevelPicker
                value={selectedHm.height}
                onChange={(v) => updateHeightmapElement(screenId, selectedHm.id, { height: v })}
              />
            </div>

            <Button size="sm" variant="danger" onClick={handleDelete}>Delete Shape</Button>
          </SettingsSection>
        )}

        {/* ─── Selected Light Inspector ─── */}
        {selectedLight && (
          <SettingsSection title="Light">
            {/* Position */}
            <div className="shadow-editor-panel__field-row">
              <NumberField icon="X" value={selectedLight.x} step={1} onChange={(v) => updateLight(screenId, selectedLight.id, { x: v })} />
              <NumberField icon="Y" value={selectedLight.y} step={1} onChange={(v) => updateLight(screenId, selectedLight.id, { y: v })} />
            </div>

            {/* Radius & Intensity */}
            <NumberField icon="R" value={selectedLight.radius} step={4} min={4} max={512} onChange={(v) => updateLight(screenId, selectedLight.id, { radius: v })} />
            <Slider
              value={selectedLight.intensity}
              min={0}
              max={2}
              step={0.05}
              label="Intensity"
              onChange={(v) => updateLight(screenId, selectedLight.id, { intensity: v })}
              showValue
            />
            <Toggle
              checked={selectedLight.castShadows}
              onChange={(v) => updateLight(screenId, selectedLight.id, { castShadows: v })}
              label="Cast Shadows"
            />
            <Button size="sm" variant="danger" onClick={handleDelete}>Delete Light</Button>
          </SettingsSection>
        )}

        {/* ─── Global Settings (only when nothing selected) ─── */}
        {!hasSelection && (
          <>
            <SettingsSection title="Sun">
              <Toggle
                checked={screenData.lighting.sunEnabled}
                onChange={(v) => updateLighting(screenId, { sunEnabled: v })}
                label="Enabled"
              />
              {screenData.lighting.sunEnabled && (
                <>
                  <div className="shadow-editor-panel__field-row">
                    <NumberField icon="∠" value={screenData.lighting.sunAngle} step={5} min={0} max={360} suffix="°" onChange={(v) => updateLighting(screenId, { sunAngle: v })} />
                    <NumberField icon="↗" value={screenData.lighting.sunElevation} step={5} min={15} max={85} suffix="°" onChange={(v) => updateLighting(screenId, { sunElevation: v })} />
                  </div>
                  <Slider
                    value={screenData.lighting.sunIntensity}
                    min={0}
                    max={2}
                    step={0.05}
                    label="Intensity"
                    onChange={(v) => updateLighting(screenId, { sunIntensity: v })}
                    showValue
                  />
                </>
              )}
            </SettingsSection>

            <SettingsSection title="Atmosphere">
              <Slider
                value={screenData.lighting.ambientIntensity}
                min={0}
                max={1}
                step={0.05}
                label="Ambient"
                onChange={(v) => updateLighting(screenId, { ambientIntensity: v })}
                showValue
              />
              <Slider
                value={screenData.lighting.shadowSoftness}
                min={0}
                max={1}
                step={0.05}
                label="Shadow Softness"
                onChange={(v) => updateLighting(screenId, { shadowSoftness: v })}
                showValue
              />
              <Toggle
                checked={screenData.lighting.dayNightCycle}
                onChange={(v) => updateLighting(screenId, { dayNightCycle: v })}
                label="Day/Night Cycle"
              />
              {screenData.lighting.dayNightCycle && (
                <Slider
                  value={screenData.lighting.cycleSpeed}
                  min={10}
                  max={600}
                  step={10}
                  label="Cycle (sec)"
                  onChange={(v) => updateLighting(screenId, { cycleSpeed: v })}
                  showValue
                />
              )}
            </SettingsSection>

            <SettingsSection title="Height Levels">
              <HeightLevelEditor />
            </SettingsSection>
          </>
        )}
      </div>

      {/* ─── Footer ─── */}
      <div className="shadow-editor-panel__footer">
        Screen #{screenId} · {screenData.heightmap.length} shapes · {screenData.lights.length} lights
      </div>
    </div>
  );
}

export { ShadowEditorPanel };
