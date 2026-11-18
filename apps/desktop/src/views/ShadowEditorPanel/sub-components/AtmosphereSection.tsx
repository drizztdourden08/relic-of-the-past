/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { useMemo } from 'react';
import { Slider, Toggle } from '@drizztdourden08/tessera/primitives';
import { SettingsSection } from '@drizztdourden08/tessera/composites';
import type { LightingSectionProps } from './LightingSection.type';

const AtmosphereSection = ({ screenId, lighting, updateLighting }: LightingSectionProps) => {
  const t = useT();
  const setters = useMemo(() => ({
    ambientIntensity: (v: number) => updateLighting(screenId, { ambientIntensity: v }),
    shadowSoftness: (v: number) => updateLighting(screenId, { shadowSoftness: v }),
    dayNightCycle: (v: boolean) => updateLighting(screenId, { dayNightCycle: v }),
    cycleSpeed: (v: number) => updateLighting(screenId, { cycleSpeed: v }),
  }), [screenId, updateLighting]);

  return (
    <SettingsSection title={t('views-shadow-editor:atmosphere.title')}>
      <Slider
        value={lighting.ambientIntensity}
        min={0}
        max={1}
        step={0.05}
        label={t('views-shadow-editor:atmosphere.ambient')}
        onChange={setters.ambientIntensity}
        showValue
      />
      <Slider
        value={lighting.shadowSoftness}
        min={0}
        max={1}
        step={0.05}
        label={t('views-shadow-editor:atmosphere.softness')}
        onChange={setters.shadowSoftness}
        showValue
      />
      <Toggle checked={lighting.dayNightCycle} onChange={setters.dayNightCycle} label={t('views-shadow-editor:atmosphere.dayNight')} />
      {lighting.dayNightCycle && (
        <Slider
          value={lighting.cycleSpeed}
          min={10}
          max={600}
          step={10}
          label={t('views-shadow-editor:atmosphere.cycle')}
          onChange={setters.cycleSpeed}
          showValue
        />
      )}
    </SettingsSection>
  );
};

export { AtmosphereSection };
