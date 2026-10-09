/* @layer renderer-widgets @kind component */
import { NumberInput } from '@drizztdourden08/tessera/primitives';
import { ControlMenuRow } from '@drizztdourden08/tessera/composites';
import { useWidgetPref } from '@app/hooks/useWidgetPref';
import { SCREEN_LIMIT_HINT } from './SimulatorWidgetSettings.constants';

const SimulatorWidgetSettings = () => {
  const [screenLimit, setScreenLimit] = useWidgetPref<number | null>('simulator', 'screenLimit', null);

  const handleChange = (value: number) => {
    setScreenLimit(Number.isNaN(value) || value < 1 ? null : Math.floor(value));
  };

  return (
    <ControlMenuRow label="Screen limit" hint={SCREEN_LIMIT_HINT}>
      <NumberInput min={1} placeholder="unlimited" value={screenLimit ?? ''} onChange={handleChange} />
    </ControlMenuRow>
  );
};

export { SimulatorWidgetSettings };
