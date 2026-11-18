/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { useShadowEditorStore } from '@app/stores/shadow-editor-store';
import { useT } from '@drizztdourden08/brock-react';
import { Box, Slider } from '@drizztdourden08/tessera/primitives';

const LightToolOptions = () => {
  const t = useT();
  const { defaultLightIntensity, setDefaultLightIntensity, defaultLightRadius, setDefaultLightRadius } = useShadowEditorStore();

  return (
    <Box className="shadow-editor-panel__tool-opts">
      <Slider
        value={defaultLightIntensity}
        min={0}
        max={2}
        step={0.05}
        label={t('views-shadow-editor:intensity')}
        onChange={setDefaultLightIntensity}
        showValue
      />
      <Slider
        value={defaultLightRadius}
        min={8}
        max={256}
        step={4}
        label={t('views-shadow-editor:radius')}
        onChange={setDefaultLightRadius}
        showValue
      />
    </Box>
  );
};

export { LightToolOptions };
