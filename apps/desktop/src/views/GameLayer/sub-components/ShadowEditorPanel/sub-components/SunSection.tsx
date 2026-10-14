/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Slider, Toggle, Box } from '@drizztdourden08/tessera/primitives';
import { SettingsSection } from '@drizztdourden08/tessera/composites';
import { NumberField } from './NumberField';
import type { LightingSectionProps } from './LightingSection.type';

const SunSection = ({ screenId, lighting, updateLighting }: LightingSectionProps) => {
  const setters = useMemo(() => ({
    sunEnabled: (v: boolean) => updateLighting(screenId, { sunEnabled: v }),
    sunAngle: (v: number) => updateLighting(screenId, { sunAngle: v }),
    sunElevation: (v: number) => updateLighting(screenId, { sunElevation: v }),
    sunIntensity: (v: number) => updateLighting(screenId, { sunIntensity: v }),
  }), [screenId, updateLighting]);

  return (
    <SettingsSection title="Sun">
      <Toggle checked={lighting.sunEnabled} onChange={setters.sunEnabled} label="Enabled" />
      {lighting.sunEnabled && (
        <>
          <Box className="shadow-editor-panel__field-row">
            <NumberField icon="∠" value={lighting.sunAngle} step={5} min={0} max={360} suffix="°" onChange={setters.sunAngle} />
            <NumberField icon="^" value={lighting.sunElevation} step={5} min={15} max={85} suffix="°" onChange={setters.sunElevation} />
          </Box>
          <Slider
            value={lighting.sunIntensity}
            min={0}
            max={2}
            step={0.05}
            label="Intensity"
            onChange={setters.sunIntensity}
            showValue
          />
        </>
      )}
    </SettingsSection>
  );
};

export { SunSection };
