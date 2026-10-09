/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Box, Text, Button } from '@drizztdourden08/tessera/primitives';
import { SettingsSection } from '@drizztdourden08/tessera/composites';
import { NumberField } from './NumberField';
import { HeightLevelPicker } from './HeightLevelPicker';
import type { ShadowShapeInspectorProps } from './ShadowShapeInspector.type';

const ShadowShapeInspector = ({ screenId, selectedHm, updateHeightmapElement, handleDelete }: ShadowShapeInspectorProps) => {
  const setters = useMemo(() => {
    const setShape = (patch: Partial<typeof selectedHm.shape>) =>
      updateHeightmapElement(screenId, selectedHm.id, { shape: { ...selectedHm.shape, ...patch } });
    return {
      x: (v: number) => setShape({ x: v }),
      y: (v: number) => setShape({ y: v }),
      width: (v: number) => setShape({ width: v }),
      height: (v: number) => setShape({ height: v }),
      rotation: (v: number) => setShape({ rotation: v }),
      sides: (v: number) => setShape({ sides: v }),
      cornerRadius: (v: number) => setShape({ cornerRadius: v }),
      level: (v: number) => updateHeightmapElement(screenId, selectedHm.id, { height: v }),
    };
  }, [screenId, selectedHm, updateHeightmapElement]);

  return (
    <SettingsSection title="Shape">
      <Box className="shadow-editor-panel__field-row">
        <NumberField icon="X" value={selectedHm.shape.x} step={1} onChange={setters.x} />
        <NumberField icon="Y" value={selectedHm.shape.y} step={1} onChange={setters.y} />
      </Box>

      <Box className="shadow-editor-panel__field-row">
        <NumberField icon="W" value={selectedHm.shape.width} step={1} min={1} onChange={setters.width} />
        <NumberField icon="H" value={selectedHm.shape.height} step={1} min={1} onChange={setters.height} />
      </Box>

      <NumberField icon="⟳" value={selectedHm.shape.rotation ?? 0} step={1} min={0} max={360} suffix="°" onChange={setters.rotation} />

      {selectedHm.shape.type === 'polygon' && (
        <Box className="shadow-editor-panel__field-row">
          <NumberField icon="◇" value={selectedHm.shape.sides ?? 4} step={1} min={3} max={64} onChange={setters.sides} />
          <NumberField icon="⌒" value={selectedHm.shape.cornerRadius ?? 0} step={1} min={0} max={32} onChange={setters.cornerRadius} />
        </Box>
      )}

      <Box className="shadow-editor-panel__subsection">
        <Text className="shadow-editor-panel__sublabel">Height</Text>
        <HeightLevelPicker value={selectedHm.height} onChange={setters.level} />
      </Box>

      <Button size="sm" variant="danger" onClick={handleDelete}>Delete Shape</Button>
    </SettingsSection>
  );
};

export { ShadowShapeInspector };
