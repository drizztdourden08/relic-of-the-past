import { useEditorState } from './hooks/useEditorState';
import type { HeightmapElement, LightSource, ScreenLightingConfig } from '@shared/types/shadow-casting';

const ShadowEditorSidebar = () => {
  const {
    selectedElementId,
    selectedType,
    getCurrentScreenData,
    updateHeightmapElement,
    updateLight,
    updateLighting,
    removeHeightmapElement,
    removeLight,
    polygonSides,
    polygonCornerRadius,
    defaultHeight,
    defaultSmoothing,
    defaultLightIntensity,
    defaultLightRadius,
    setPolygonSides,
    setPolygonCornerRadius,
    setDefaultHeight,
    setDefaultSmoothing,
    setDefaultLightIntensity,
    setDefaultLightRadius,
  } = useEditorState();

  const screenData = getCurrentScreenData();
  const lighting = screenData.lighting;

  // Find selected element
  const selectedHeightmap: HeightmapElement | undefined =
    selectedType === 'heightmap' ? screenData.heightmap.find((e) => e.id === selectedElementId) : undefined;
  const selectedLight: LightSource | undefined =
    selectedType === 'light' ? screenData.lights.find((l) => l.id === selectedElementId) : undefined;

  // ─── Selected Heightmap Element Properties ───
  if (selectedHeightmap) {
    return (
      <div className="shadow-editor__sidebar">
        <h3 className="shadow-editor__sidebar-title">Heightmap Element</h3>

        <label className="shadow-editor__field">
          <span>Height</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={selectedHeightmap.height}
            onChange={(e) => updateHeightmapElement(selectedHeightmap.id, { height: Number(e.target.value) })}
          />
          <span className="shadow-editor__field-value">{selectedHeightmap.height.toFixed(2)}</span>
        </label>

        <label className="shadow-editor__field">
          <span>Smoothing</span>
          <input
            type="range"
            min={0}
            max={32}
            step={1}
            value={selectedHeightmap.smoothing}
            onChange={(e) => updateHeightmapElement(selectedHeightmap.id, { smoothing: Number(e.target.value) })}
          />
          <span className="shadow-editor__field-value">{selectedHeightmap.smoothing}px</span>
        </label>

        <label className="shadow-editor__field">
          <span>Width</span>
          <input
            type="number"
            min={1}
            max={512}
            value={Math.round(selectedHeightmap.shape.width)}
            onChange={(e) => updateHeightmapElement(selectedHeightmap.id, { shape: { ...selectedHeightmap.shape, width: Number(e.target.value) } })}
          />
        </label>

        <label className="shadow-editor__field">
          <span>Height</span>
          <input
            type="number"
            min={1}
            max={448}
            value={Math.round(selectedHeightmap.shape.height)}
            onChange={(e) => updateHeightmapElement(selectedHeightmap.id, { shape: { ...selectedHeightmap.shape, height: Number(e.target.value) } })}
          />
        </label>

        <label className="shadow-editor__field">
          <span>Rotation</span>
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={selectedHeightmap.shape.rotation ?? 0}
            onChange={(e) => updateHeightmapElement(selectedHeightmap.id, { shape: { ...selectedHeightmap.shape, rotation: Number(e.target.value) } })}
          />
          <span className="shadow-editor__field-value">{selectedHeightmap.shape.rotation ?? 0}°</span>
        </label>

        {selectedHeightmap.shape.type === 'polygon' && (
          <>
            <label className="shadow-editor__field">
              <span>Sides</span>
              <input
                type="number"
                min={3}
                max={64}
                value={selectedHeightmap.shape.sides ?? 4}
                onChange={(e) => updateHeightmapElement(selectedHeightmap.id, { shape: { ...selectedHeightmap.shape, sides: Number(e.target.value) } })}
              />
            </label>
            <label className="shadow-editor__field">
              <span>Corner Radius</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={selectedHeightmap.shape.cornerRadius ?? 0}
                onChange={(e) => updateHeightmapElement(selectedHeightmap.id, { shape: { ...selectedHeightmap.shape, cornerRadius: Number(e.target.value) } })}
              />
              <span className="shadow-editor__field-value">{(selectedHeightmap.shape.cornerRadius ?? 0).toFixed(2)}</span>
            </label>
          </>
        )}

        <button className="shadow-editor__delete-btn" onClick={() => removeHeightmapElement(selectedHeightmap.id)}>
          Delete Element
        </button>
      </div>
    );
  }

  // ─── Selected Light Properties ───
  if (selectedLight) {
    return (
      <div className="shadow-editor__sidebar">
        <h3 className="shadow-editor__sidebar-title">
          {selectedLight.type === 'point' ? 'Point Light' : 'Shape Light'}
        </h3>

        <label className="shadow-editor__field">
          <span>Intensity</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={selectedLight.intensity}
            onChange={(e) => updateLight(selectedLight.id, { intensity: Number(e.target.value) })}
          />
          <span className="shadow-editor__field-value">{selectedLight.intensity.toFixed(2)}</span>
        </label>

        <label className="shadow-editor__field">
          <span>Radius</span>
          <input
            type="range"
            min={8}
            max={256}
            step={1}
            value={selectedLight.radius}
            onChange={(e) => updateLight(selectedLight.id, { radius: Number(e.target.value) })}
          />
          <span className="shadow-editor__field-value">{selectedLight.radius}px</span>
        </label>

        <label className="shadow-editor__field">
          <span>Color</span>
          <select
            value={selectedLight.color === 'sample' ? 'sample' : 'custom'}
            onChange={(e) => updateLight(selectedLight.id, { color: e.target.value === 'sample' ? 'sample' : '#ffffff' })}
          >
            <option value="sample">Auto-sample from game</option>
            <option value="custom">Custom color</option>
          </select>
        </label>

        {selectedLight.color !== 'sample' && (
          <label className="shadow-editor__field">
            <span>Custom Color</span>
            <input
              type="color"
              value={selectedLight.color}
              onChange={(e) => updateLight(selectedLight.id, { color: e.target.value })}
            />
          </label>
        )}

        <label className="shadow-editor__field shadow-editor__field--checkbox">
          <input
            type="checkbox"
            checked={selectedLight.castShadows}
            onChange={(e) => updateLight(selectedLight.id, { castShadows: e.target.checked })}
          />
          <span>Cast Shadows</span>
        </label>

        <button className="shadow-editor__delete-btn" onClick={() => removeLight(selectedLight.id)}>
          Delete Light
        </button>
      </div>
    );
  }

  // ─── Global / Tool Settings ───
  return (
    <div className="shadow-editor__sidebar">
      <h3 className="shadow-editor__sidebar-title">Global Lighting</h3>

      <label className="shadow-editor__field shadow-editor__field--checkbox">
        <input
          type="checkbox"
          checked={lighting.sunEnabled}
          onChange={(e) => updateLighting({ sunEnabled: e.target.checked })}
        />
        <span>Sun Enabled</span>
      </label>

      <label className="shadow-editor__field">
        <span>Sun Angle</span>
        <input
          type="range"
          min={0}
          max={360}
          step={1}
          value={lighting.sunAngle}
          onChange={(e) => updateLighting({ sunAngle: Number(e.target.value) })}
        />
        <span className="shadow-editor__field-value">{lighting.sunAngle}°</span>
      </label>

      <label className="shadow-editor__field">
        <span>Sun Elevation</span>
        <input
          type="range"
          min={0}
          max={90}
          step={1}
          value={lighting.sunElevation}
          onChange={(e) => updateLighting({ sunElevation: Number(e.target.value) })}
        />
        <span className="shadow-editor__field-value">{lighting.sunElevation}°</span>
      </label>

      <label className="shadow-editor__field">
        <span>Sun Intensity</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={lighting.sunIntensity}
          onChange={(e) => updateLighting({ sunIntensity: Number(e.target.value) })}
        />
        <span className="shadow-editor__field-value">{lighting.sunIntensity.toFixed(2)}</span>
      </label>

      <label className="shadow-editor__field">
        <span>Ambient Intensity</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={lighting.ambientIntensity}
          onChange={(e) => updateLighting({ ambientIntensity: Number(e.target.value) })}
        />
        <span className="shadow-editor__field-value">{lighting.ambientIntensity.toFixed(2)}</span>
      </label>

      <label className="shadow-editor__field shadow-editor__field--checkbox">
        <input
          type="checkbox"
          checked={lighting.dayNightCycle}
          onChange={(e) => updateLighting({ dayNightCycle: e.target.checked })}
        />
        <span>Day/Night Cycle</span>
      </label>

      {lighting.dayNightCycle && (
        <label className="shadow-editor__field">
          <span>Cycle Duration</span>
          <input
            type="range"
            min={10}
            max={600}
            step={10}
            value={lighting.cycleSpeed}
            onChange={(e) => updateLighting({ cycleSpeed: Number(e.target.value) })}
          />
          <span className="shadow-editor__field-value">{lighting.cycleSpeed}s</span>
        </label>
      )}

      <label className="shadow-editor__field">
        <span>Shadow Softness</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={lighting.shadowSoftness}
          onChange={(e) => updateLighting({ shadowSoftness: Number(e.target.value) })}
        />
        <span className="shadow-editor__field-value">{lighting.shadowSoftness.toFixed(2)}</span>
      </label>

      <hr className="shadow-editor__separator" />

      <h3 className="shadow-editor__sidebar-title">Tool Defaults</h3>

      <label className="shadow-editor__field">
        <span>Polygon Sides</span>
        <input
          type="number"
          min={3}
          max={64}
          value={polygonSides}
          onChange={(e) => setPolygonSides(Number(e.target.value))}
        />
      </label>

      <label className="shadow-editor__field">
        <span>Corner Radius</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={polygonCornerRadius}
          onChange={(e) => setPolygonCornerRadius(Number(e.target.value))}
        />
        <span className="shadow-editor__field-value">{polygonCornerRadius.toFixed(2)}</span>
      </label>

      <label className="shadow-editor__field">
        <span>Default Height</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={defaultHeight}
          onChange={(e) => setDefaultHeight(Number(e.target.value))}
        />
        <span className="shadow-editor__field-value">{defaultHeight.toFixed(2)}</span>
      </label>

      <label className="shadow-editor__field">
        <span>Default Smoothing</span>
        <input
          type="range"
          min={0}
          max={32}
          step={1}
          value={defaultSmoothing}
          onChange={(e) => setDefaultSmoothing(Number(e.target.value))}
        />
        <span className="shadow-editor__field-value">{defaultSmoothing}px</span>
      </label>

      <label className="shadow-editor__field">
        <span>Light Intensity</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={defaultLightIntensity}
          onChange={(e) => setDefaultLightIntensity(Number(e.target.value))}
        />
        <span className="shadow-editor__field-value">{defaultLightIntensity.toFixed(2)}</span>
      </label>

      <label className="shadow-editor__field">
        <span>Light Radius</span>
        <input
          type="range"
          min={8}
          max={256}
          step={4}
          value={defaultLightRadius}
          onChange={(e) => setDefaultLightRadius(Number(e.target.value))}
        />
        <span className="shadow-editor__field-value">{defaultLightRadius}px</span>
      </label>

      <hr className="shadow-editor__separator" />
      <div className="shadow-editor__sidebar-info">
        <p>Screen: {screenData.screenId}</p>
        <p>Elements: {screenData.heightmap.length}</p>
        <p>Lights: {screenData.lights.length}</p>
      </div>
    </div>
  );
};

export { ShadowEditorSidebar };
