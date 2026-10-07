/* @layer renderer-widgets @kind component */
/**
 * The simulator widget's own options: the screen limit, the same pref the run
 * controls edit, so a change in either place is seen by the other.
 */
import { NumberInput } from '@ds/primitives';
import { OptionRow } from '@ds/composites/Widget/sub-components/WidgetOptions';
import { useWidgetPref } from '@app/hooks/useWidgetPref';

const SimulatorWidgetSettings = () => {
  const [screenLimit, setScreenLimit] = useWidgetPref<number | null>('simulator', 'screenLimit', null);

  const handleChange = (value: number) => {
    setScreenLimit(Number.isNaN(value) || value < 1 ? null : Math.floor(value));
  };

  return (
    <OptionRow label="Screen limit" hint="Blank runs without a limit">
      <NumberInput min={1} placeholder="unlimited" value={screenLimit ?? ''} onChange={handleChange} />
    </OptionRow>
  );
};

export { SimulatorWidgetSettings };
