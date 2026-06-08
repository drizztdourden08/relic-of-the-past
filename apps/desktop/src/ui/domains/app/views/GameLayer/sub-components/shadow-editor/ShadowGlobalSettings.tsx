/* @layer renderer-components @kind component */
/** Global lighting settings (Sun / Atmosphere / Height Levels) for the Shadow Editor panel. */
import { Slider } from '../../../../../../design-system/primitives/Slider';
import { Toggle } from '../../../../../../design-system/primitives/Toggle';
import { SettingsSection } from '../../../../../../design-system/composites/SettingsSection';
import { NumberField } from './NumberField';
import { HeightLevelEditor } from './HeightLevelEditor';
import type { ScreenShadowData, ScreenLightingConfig } from '@shared/types/shadow-casting';

interface ShadowGlobalSettingsProps {
  screenId: number;
  screenData: ScreenShadowData;
  updateLighting: (screenId: number, patch: Partial<ScreenLightingConfig>) => void;
}

const ShadowGlobalSettings = ({ screenId, screenData, updateLighting }: ShadowGlobalSettingsProps) => {
  return (
    <>
      <SettingsSection title="Sun">
        <Toggle
          checked={screenData.lighting.sunEnabled}
          onChange={(v) => updateLighting(screenId, { sunEnabled: v })}
          label="Enabled"
        />
        {screenData.lighting.sunEnabled && (
          <>
            <div className="shadow-editor-panel__field-row">
              <NumberField icon="∠" value={screenData.lighting.sunAngle} step={5} min={0} max={360} suffix="°" onChange={(v) => updateLighting(screenId, { sunAngle: v })} />
              <NumberField icon="↗" value={screenData.lighting.sunElevation} step={5} min={15} max={85} suffix="°" onChange={(v) => updateLighting(screenId, { sunElevation: v })} />
            </div>
            <Slider
              value={screenData.lighting.sunIntensity}
              min={0}
              max={2}
              step={0.05}
              label="Intensity"
              onChange={(v) => updateLighting(screenId, { sunIntensity: v })}
              showValue
            />
          </>
        )}
      </SettingsSection>

      <SettingsSection title="Atmosphere">
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
          label="Shadow Softness"
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
            min={10}
            max={600}
            step={10}
            label="Cycle (sec)"
            onChange={(v) => updateLighting(screenId, { cycleSpeed: v })}
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
