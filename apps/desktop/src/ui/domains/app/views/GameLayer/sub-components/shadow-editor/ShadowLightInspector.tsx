/* @layer renderer-components @kind component */
/** Selected-light inspector for the Shadow Editor panel. */
import { Slider } from '../../../../../../design-system/primitives/Slider';
import { Toggle } from '../../../../../../design-system/primitives/Toggle';
import { Button } from '../../../../../../design-system/primitives/Button';
import { Box } from '../../../../../../design-system/primitives/Box';
import { SettingsSection } from '../../../../../../design-system/composites/SettingsSection';
import { NumberField } from './NumberField';
import type { LightSource } from '@shared/types/shadow-casting';

interface ShadowLightInspectorProps {
  screenId: number;
  selectedLight: LightSource;
  updateLight: (screenId: number, id: string, patch: Partial<LightSource>) => void;
  handleDelete: () => void;
}

const ShadowLightInspector = ({ screenId, selectedLight, updateLight, handleDelete }: ShadowLightInspectorProps) => {
  return (
    <SettingsSection title="Light">
      {/* Position */}
      <Box className="shadow-editor-panel__field-row">
        <NumberField icon="X" value={selectedLight.x} step={1} onChange={(v) => updateLight(screenId, selectedLight.id, { x: v })} />
        <NumberField icon="Y" value={selectedLight.y} step={1} onChange={(v) => updateLight(screenId, selectedLight.id, { y: v })} />
      </Box>

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
  );
};

export { ShadowLightInspector };
