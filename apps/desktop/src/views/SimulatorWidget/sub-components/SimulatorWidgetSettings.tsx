/* @layer renderer-widgets @kind component */
import { NumberInput } from '@drizztdourden08/tessera/primitives';
import { ControlMenuRow } from '@drizztdourden08/tessera/composites';
import { useT, useWidgetPref } from '@drizztdourden08/brock-react';
import { screenLimitHint } from './SimulatorWidgetSettings.constants';

const SimulatorWidgetSettings = () => {
  const t = useT();
  const [screenLimit, setScreenLimit] = useWidgetPref<number | null>('simulator', 'screenLimit', null);

  const handleChange = (value: number) => {
    setScreenLimit(Number.isNaN(value) || value < 1 ? null : Math.floor(value));
  };

  return (
    <ControlMenuRow label={t('views-simulator:settings.screen.limit.label')} hint={screenLimitHint(t)}>
      <NumberInput min={1} placeholder={t('views-simulator:controls.unlimited')} value={screenLimit ?? ''} onChange={handleChange} />
    </ControlMenuRow>
  );
};

export { SimulatorWidgetSettings };
