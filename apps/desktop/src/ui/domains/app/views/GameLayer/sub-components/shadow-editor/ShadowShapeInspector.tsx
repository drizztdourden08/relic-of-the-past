/* @layer renderer-components @kind component */
/** Selected-heightmap-shape inspector for the Shadow Editor panel. */
import { Button } from '../../../../../../design-system/primitives/Button';
import { SettingsSection } from '../../../../../../design-system/composites/SettingsSection';
import { NumberField } from './NumberField';
import { HeightLevelPicker } from './HeightLevelPicker';
import type { HeightmapElement } from '@shared/types/shadow-casting';

interface ShadowShapeInspectorProps {
  screenId: number;
  selectedHm: HeightmapElement;
  updateHeightmapElement: (screenId: number, id: string, patch: Partial<HeightmapElement>) => void;
  handleDelete: () => void;
}

const ShadowShapeInspector = ({ screenId, selectedHm, updateHeightmapElement, handleDelete }: ShadowShapeInspectorProps) => {
  return (
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
  );
};

export { ShadowShapeInspector };
