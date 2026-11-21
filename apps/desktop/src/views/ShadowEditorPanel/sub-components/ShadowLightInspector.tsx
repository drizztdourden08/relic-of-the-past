/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { useMemo } from 'react';
import { Slider, Toggle, Button } from '@drizztdourden08/tessera/primitives';
import { SettingsSection } from '@drizztdourden08/tessera/composites';
import { NumberField } from './NumberField';
import { PositionFields } from './PositionFields';
import type { ShadowLightInspectorProps } from './ShadowLightInspector.type';

const ShadowLightInspector = ({ screenId, selectedLight, updateLight, handleDelete }: ShadowLightInspectorProps) => {
  const t = useT();
  const setters = useMemo(() => ({
    x: (v: number) => updateLight(screenId, selectedLight.id, { x: v }),
    y: (v: number) => updateLight(screenId, selectedLight.id, { y: v }),
    radius: (v: number) => updateLight(screenId, selectedLight.id, { radius: v }),
    intensity: (v: number) => updateLight(screenId, selectedLight.id, { intensity: v }),
    castShadows: (v: boolean) => updateLight(screenId, selectedLight.id, { castShadows: v }),
  }), [screenId, selectedLight.id, updateLight]);

  return (
    <SettingsSection title={t('views-shadow-editor:light.title')}>
      <PositionFields x={selectedLight.x} y={selectedLight.y} onX={setters.x} onY={setters.y} />

      <NumberField icon="R" value={selectedLight.radius} step={4} min={4} max={512} onChange={setters.radius} />
      <Slider
        value={selectedLight.intensity}
        min={0}
        max={2}
        step={0.05}
        label={t('views-shadow-editor:intensity')}
        onChange={setters.intensity}
        showValue
      />
      <Toggle
        checked={selectedLight.castShadows}
        onChange={setters.castShadows}
        label={t('views-shadow-editor:light.castShadows')}
      />
      <Button size="sm" variant="danger" onClick={handleDelete}>{t('views-shadow-editor:light.delete')}</Button>
    </SettingsSection>
  );
};

export { ShadowLightInspector };
