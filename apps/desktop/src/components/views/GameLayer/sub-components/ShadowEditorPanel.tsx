import { useCallback } from 'react';
import { useShadowEditorStore } from '../../../../stores/shadow-editor-store';
import type { EditorTool, HeightPreset } from '../../../../stores/shadow-editor-store';
import { SegmentedControl } from '../../../primitives/SegmentedControl';
import { Slider } from '../../../primitives/Slider';
import { Toggle } from '../../../primitives/Toggle';
import { Button } from '../../../primitives/Button';
import { SettingsSection } from '../../../composites/SettingsSection';
import { wasmGetViewportInfo } from '../../../../lib/game';
import './ShadowEditorPanel.css';

const TOOL_OPTIONS: { value: EditorTool; label: string }[] = [
  { value: 'select', label: '↖ Select' },
  { value: 'polygon', label: '⬡ Shape' },
  { value: 'freehand', label: '✏ Draw' },
  { value: 'point-light', label: '💡 Point' },
  { value: 'shape-light', label: '🔦 Area' },
];

const HEIGHT_PRESETS: { value: HeightPreset; label: string }[] = [
  { value: '0.25', label: 'Low' },
  { value: '0.5', label: 'Mid' },
  { value: '0.75', label: 'High' },
  { value: '1.0', label: 'Wall' },
  { value: 'custom', label: 'Custom' },
];

const POLYGON_OPTIONS = [
  { value: '3', label: '△' },
  { value: '4', label: '◻' },
  { value: '5', label: '⬠' },
  { value: '6', label: '⬡' },
  { value: '8', label: '◯' },
];

function ShadowEditorPanel() {
  const {
    open,
    activeTool,
    setActiveTool,
    selectedElementId,
    selectedType,
    heightPreset,
    setHeightPreset,
    customHeight,
    setCustomHeight,
    polygonSides,
    setPolygonSides,
    polygonCornerRadius,
    setPolygonCornerRadius,
    defaultSmoothing,
    setDefaultSmoothing,
    defaultLightIntensity,
    setDefaultLightIntensity,
    defaultLightRadius,
    setDefaultLightRadius,
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
  } = useShadowEditorStore();

  // We'll need current screen for element editing
  // This panel reads from the store — the overlay drives current screen detection
  const getCurrentScreenId = useCallback((): number => {
    const vp = wasmGetViewportInfo();
    if (!vp) return 0;
    const col = Math.floor((vp.cameraX + 128) / 512) & 7;
    const row = Math.floor((vp.cameraY + 112) / 512) & 7;
    return row * 8 + col;
  }, []);

  const screenId = getCurrentScreenId();
  const screenData = getScreenData(screenId);

  // Get selected element data
  const selectedHm = selectedType === 'heightmap' ? screenData.heightmap.find((e) => e.id === selectedElementId) : null;
  const selectedLight = selectedType === 'light' ? screenData.lights.find((l) => l.id === selectedElementId) : null;

  const handleDelete = useCallback(() => {
    if (!selectedElementId) return;
    if (selectedType === 'heightmap') removeHeightmapElement(screenId, selectedElementId);
    if (selectedType === 'light') removeLight(screenId, selectedElementId);
  }, [selectedElementId, selectedType, screenId, removeHeightmapElement, removeLight]);

  if (!open) return null;

  const handleClose = () => useShadowEditorStore.getState().setOpen(false);

  return (
    <div className="shadow-editor-panel">
      <div className="shadow-editor-panel__header">
        <span className="shadow-editor-panel__title">Shadow Editor</span>
        {dirty && <span className="shadow-editor-panel__dirty">●</span>}
        <div className="shadow-editor-panel__actions">
          <Button size="sm" variant="ghost" onClick={() => undo(screenId)}>↶</Button>
          <Button size="sm" variant="ghost" onClick={() => redo(screenId)}>↷</Button>
          <Button size="sm" variant="primary" onClick={() => save()} disabled={!dirty}>Save</Button>
          <Button size="sm" variant="ghost" onClick={handleClose}>✕</Button>
        </div>
      </div>

      {/* Tool Selection */}
      <SettingsSection title="Tool">
        <SegmentedControl
          value={activeTool}
          options={TOOL_OPTIONS}
          onChange={(v) => setActiveTool(v as EditorTool)}
        />
      </SettingsSection>

      {/* Shape Tool Options */}
      {(activeTool === 'polygon' || activeTool === 'shape-light') && (
        <SettingsSection title="Shape">
          <SegmentedControl
            value={String(polygonSides)}
            options={POLYGON_OPTIONS}
            onChange={(v) => setPolygonSides(Number(v))}
            label="Sides"
          />
          <Slider
            value={polygonCornerRadius}
            min={0}
            max={32}
            step={1}
            label="Corner Radius"
            onChange={setPolygonCornerRadius}
          />
        </SettingsSection>
      )}

      {/* Height Preset (for shape/freehand tools) */}
      {(activeTool === 'polygon' || activeTool === 'freehand') && (
        <SettingsSection title="Height">
          <SegmentedControl
            value={heightPreset}
            options={HEIGHT_PRESETS}
            onChange={(v) => setHeightPreset(v as HeightPreset)}
          />
          {heightPreset === 'custom' && (
            <Slider
              value={customHeight}
              min={0}
              max={1}
              step={0.01}
              label="Value"
              onChange={setCustomHeight}
              showValue
            />
          )}
          <Slider
            value={defaultSmoothing}
            min={0}
            max={32}
            step={1}
            label="Smoothing"
            onChange={setDefaultSmoothing}
          />
        </SettingsSection>
      )}

      {/* Light Options */}
      {(activeTool === 'point-light' || activeTool === 'shape-light') && (
        <SettingsSection title="Light Defaults">
          <Slider
            value={defaultLightIntensity}
            min={0}
            max={2}
            step={0.05}
            label="Intensity"
            onChange={setDefaultLightIntensity}
            showValue
          />
          <Slider
            value={defaultLightRadius}
            min={8}
            max={256}
            step={4}
            label="Radius"
            onChange={setDefaultLightRadius}
            showValue
          />
        </SettingsSection>
      )}

      {/* Selected Element Inspector */}
      {selectedHm && (
        <SettingsSection title="Selected Shape">
          <Slider
            value={selectedHm.height}
            min={0}
            max={1}
            step={0.01}
            label="Height"
            onChange={(v) => updateHeightmapElement(screenId, selectedHm.id, { height: v })}
            showValue
          />
          <Slider
            value={selectedHm.smoothing}
            min={0}
            max={32}
            step={1}
            label="Smoothing"
            onChange={(v) => updateHeightmapElement(screenId, selectedHm.id, { smoothing: v })}
            showValue
          />
          <Slider
            value={selectedHm.shape.rotation ?? 0}
            min={0}
            max={360}
            step={1}
            label="Rotation"
            onChange={(v) => updateHeightmapElement(screenId, selectedHm.id, { shape: { ...selectedHm.shape, rotation: v } })}
            showValue
            formatValue={(v) => `${v}°`}
          />
          <div className="shadow-editor-panel__row">
            <label className="shadow-editor-panel__field">
              <span>W</span>
              <input
                type="number"
                value={Math.round(selectedHm.shape.width)}
                onChange={(e) => updateHeightmapElement(screenId, selectedHm.id, { shape: { ...selectedHm.shape, width: Number(e.target.value) || selectedHm.shape.width } })}
              />
            </label>
            <label className="shadow-editor-panel__field">
              <span>H</span>
              <input
                type="number"
                value={Math.round(selectedHm.shape.height)}
                onChange={(e) => updateHeightmapElement(screenId, selectedHm.id, { shape: { ...selectedHm.shape, height: Number(e.target.value) || selectedHm.shape.height } })}
              />
            </label>
          </div>
          <Button size="sm" variant="danger" onClick={handleDelete}>Delete</Button>
        </SettingsSection>
      )}

      {selectedLight && (
        <SettingsSection title="Selected Light">
          <Slider
            value={selectedLight.intensity}
            min={0}
            max={2}
            step={0.05}
            label="Intensity"
            onChange={(v) => updateLight(screenId, selectedLight.id, { intensity: v })}
            showValue
          />
          <Slider
            value={selectedLight.radius}
            min={8}
            max={256}
            step={4}
            label="Radius"
            onChange={(v) => updateLight(screenId, selectedLight.id, { radius: v })}
            showValue
          />
          <Toggle
            checked={selectedLight.castShadows}
            onChange={(v) => updateLight(screenId, selectedLight.id, { castShadows: v })}
            label="Cast Shadows"
          />
          <Button size="sm" variant="danger" onClick={handleDelete}>Delete</Button>
        </SettingsSection>
      )}

      {/* Screen Lighting */}
      <SettingsSection title="Lighting">
        <Toggle
          checked={screenData.lighting.sunEnabled}
          onChange={(v) => updateLighting(screenId, { sunEnabled: v })}
          label="Sun"
        />
        {screenData.lighting.sunEnabled && (
          <>
            <Slider
              value={screenData.lighting.sunAngle}
              min={0}
              max={360}
              step={1}
              label="Sun Angle"
              onChange={(v) => updateLighting(screenId, { sunAngle: v })}
              showValue
              formatValue={(v) => `${v}°`}
            />
            <Slider
              value={screenData.lighting.sunElevation}
              min={15}
              max={85}
              step={1}
              label="Elevation"
              onChange={(v) => updateLighting(screenId, { sunElevation: v })}
              showValue
              formatValue={(v) => `${v}°`}
            />
            <Slider
              value={screenData.lighting.sunIntensity}
              min={0}
              max={2}
              step={0.05}
              label="Sun Intensity"
              onChange={(v) => updateLighting(screenId, { sunIntensity: v })}
              showValue
            />
          </>
        )}
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
          label="Softness"
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
            min={0.1}
            max={5}
            step={0.1}
            label="Cycle Speed"
            onChange={(v) => updateLighting(screenId, { cycleSpeed: v })}
            showValue
            formatValue={(v) => `${v.toFixed(1)}x`}
          />
        )}
      </SettingsSection>

      {/* Screen data count */}
      <div className="shadow-editor-panel__info">
        Screen #{screenId} — {screenData.heightmap.length} shapes, {screenData.lights.length} lights
      </div>
    </div>
  );
}

export { ShadowEditorPanel };
