/* @layer renderer-components @kind component */
import { useMemo } from 'react';
import { Slider } from '../../../../../../design-system/primitives/Slider';
import { Toggle } from '../../../../../../design-system/primitives/Toggle';
import { Box } from '../../../../../../design-system/primitives/Box';
import { SettingsSection } from '../../../../../../design-system/composites/SettingsSection';
import { NumberField } from './NumberField';
import { HeightLevelEditor } from './HeightLevelEditor';
import type { ShadowGlobalSettingsProps } from './ShadowGlobalSettings.type';

const ShadowGlobalSettings = ({ screenId, screenData, updateLighting }: ShadowGlobalSettingsProps) => {
  const setters = useMemo(() => ({
    sunEnabled: (v: boolean) => updateLighting(screenId, { sunEnabled: v }),
    sunAngle: (v: number) => updateLighting(screenId, { sunAngle: v }),
    sunElevation: (v: number) => updateLighting(screenId, { sunElevation: v }),
    sunIntensity: (v: number) => updateLighting(screenId, { sunIntensity: v }),
    ambientIntensity: (v: number) => updateLighting(screenId, { ambientIntensity: v }),
    shadowSoftness: (v: number) => updateLighting(screenId, { shadowSoftness: v }),
    dayNightCycle: (v: boolean) => updateLighting(screenId, { dayNightCycle: v }),
    cycleSpeed: (v: number) => updateLighting(screenId, { cycleSpeed: v }),
  }), [screenId, updateLighting]);
  const { lighting } = screenData;

  return (
    <>
      <SettingsSection title="Sun">
        <Toggle checked={lighting.sunEnabled} onChange={setters.sunEnabled} label="Enabled" />
        {lighting.sunEnabled && (
          <>
            <Box className="shadow-editor-panel__field-row">
              <NumberField icon="∠" value={lighting.sunAngle} step={5} min={0} max={360} suffix="°" onChange={setters.sunAngle} />
              <NumberField icon="↗" value={lighting.sunElevation} step={5} min={15} max={85} suffix="°" onChange={setters.sunElevation} />
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

      <SettingsSection title="Height Levels">
        <HeightLevelEditor />
      </SettingsSection>
    </>
  );
};

export { ShadowGlobalSettings };
