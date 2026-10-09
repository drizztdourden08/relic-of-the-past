/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Slider, Toggle, Button, Box } from '@drizztdourden08/tessera/primitives';
import { SettingsSection } from '@drizztdourden08/tessera/composites';
import { NumberField } from './NumberField';
import type { ShadowLightInspectorProps } from './ShadowLightInspector.type';

const ShadowLightInspector = ({ screenId, selectedLight, updateLight, handleDelete }: ShadowLightInspectorProps) => {
  const setters = useMemo(() => ({
    x: (v: number) => updateLight(screenId, selectedLight.id, { x: v }),
    y: (v: number) => updateLight(screenId, selectedLight.id, { y: v }),
    radius: (v: number) => updateLight(screenId, selectedLight.id, { radius: v }),
    intensity: (v: number) => updateLight(screenId, selectedLight.id, { intensity: v }),
    castShadows: (v: boolean) => updateLight(screenId, selectedLight.id, { castShadows: v }),
  }), [screenId, selectedLight.id, updateLight]);

  return (
    <SettingsSection title="Light">
      <Box className="shadow-editor-panel__field-row">
        <NumberField icon="X" value={selectedLight.x} step={1} onChange={setters.x} />
        <NumberField icon="Y" value={selectedLight.y} step={1} onChange={setters.y} />
      </Box>

      <NumberField icon="R" value={selectedLight.radius} step={4} min={4} max={512} onChange={setters.radius} />
      <Slider
        value={selectedLight.intensity}
        min={0}
        max={2}
        step={0.05}
        label="Intensity"
        onChange={setters.intensity}
        showValue
      />
      <Toggle
        checked={selectedLight.castShadows}
        onChange={setters.castShadows}
        label="Cast Shadows"
      />
      <Button size="sm" variant="danger" onClick={handleDelete}>Delete Light</Button>
    </SettingsSection>
  );
};

export { ShadowLightInspector };
