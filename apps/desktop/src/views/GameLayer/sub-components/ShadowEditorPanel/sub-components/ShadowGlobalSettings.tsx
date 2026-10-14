/* @layer renderer-components @kind component */
import { SettingsSection } from '@drizztdourden08/tessera/composites';
import { AtmosphereSection } from './AtmosphereSection';
import { HeightLevelEditor } from './HeightLevelEditor';
import { SunSection } from './SunSection';
import type { ShadowGlobalSettingsProps } from './ShadowGlobalSettings.type';

const ShadowGlobalSettings = ({ screenId, screenData, updateLighting }: ShadowGlobalSettingsProps) => {
  const { lighting } = screenData;

  return (
    <>
      <SunSection screenId={screenId} lighting={lighting} updateLighting={updateLighting} />
      <AtmosphereSection screenId={screenId} lighting={lighting} updateLighting={updateLighting} />

      <SettingsSection title="Height Levels">
        <HeightLevelEditor />
      </SettingsSection>
    </>
  );
};

export { ShadowGlobalSettings };
