/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Slider, Toggle } from '@drizztdourden08/tessera/primitives';
import { SettingsSection } from '@drizztdourden08/tessera/composites';
import type { LightingSectionProps } from './LightingSection.type';

const AtmosphereSection = ({ screenId, lighting, updateLighting }: LightingSectionProps) => {
  const setters = useMemo(() => ({
    ambientIntensity: (v: number) => updateLighting(screenId, { ambientIntensity: v }),
    shadowSoftness: (v: number) => updateLighting(screenId, { shadowSoftness: v }),
    dayNightCycle: (v: boolean) => updateLighting(screenId, { dayNightCycle: v }),
    cycleSpeed: (v: number) => updateLighting(screenId, { cycleSpeed: v }),
  }), [screenId, updateLighting]);

  return (
    <SettingsSection title="Atmosphere">
      <Slider
        value={lighting.ambientIntensity}
        min={0}
        max={1}
        step={0.05}
        label="Ambient"
        onChange={setters.ambientIntensity}
        showValue
      />
      <Slider
        value={lighting.shadowSoftness}
        min={0}
        max={1}
        step={0.05}
        label="Shadow Softness"
        onChange={setters.shadowSoftness}
        showValue
      />
      <Toggle checked={lighting.dayNightCycle} onChange={setters.dayNightCycle} label="Day/Night Cycle" />
      {lighting.dayNightCycle && (
        <Slider
          value={lighting.cycleSpeed}
          min={10}
          max={600}
          step={10}
          label="Cycle (sec)"
          onChange={setters.cycleSpeed}
          showValue
        />
      )}
    </SettingsSection>
  );
};

export { AtmosphereSection };
