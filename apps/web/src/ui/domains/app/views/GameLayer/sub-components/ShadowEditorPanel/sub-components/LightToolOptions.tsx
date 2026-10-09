/* @layer renderer-components @kind component */
import { useShadowEditorStore } from '../../../../../../../../stores/shadow-editor-store';
import { Box } from '../../../../../../../design-system/primitives/Box';
import { Slider } from '../../../../../../../design-system/primitives/Slider';

const LightToolOptions = () => {
  const { defaultLightIntensity, setDefaultLightIntensity, defaultLightRadius, setDefaultLightRadius } = useShadowEditorStore();

  return (
    <Box className="shadow-editor-panel__tool-opts">
      <Slider
        value={defaultLightIntensity}
        min={0}
        max={2}
        step={0.05}
        label="Intensity"
        onChange={setDefaultLightIntensity}
        showValue
      />
      <Slider
        value={defaultLightRadius}
        min={8}
        max={256}
        step={4}
        label="Radius"
        onChange={setDefaultLightRadius}
        showValue
      />
    </Box>
  );
};

export { LightToolOptions };
