/* @layer renderer-components @kind component */
import { Slider } from '@drizztdourden08/tessera/primitives';
import type { LayerSlidersProps } from './LayerSliders.type';

const formatPercent = (value: number): string => `${value}%`;

const LayerSliders = (props: LayerSlidersProps) => {
  const { layer, disabled, onChange } = props;
  return (
    <>
      <Slider
        label="Volume"
        value={layer.volume}
        min={0}
        max={100}
        step={1}
        disabled={disabled}
        showValue
        formatValue={formatPercent}
        onChange={(volume) => onChange({ volume })}
      />

      <Slider
        label="Chance"
        description="How often this layer sounds when it starts. 100% is every time."
        value={layer.chance ?? 100}
        min={1}
        max={100}
        step={1}
        disabled={disabled}
        showValue
        formatValue={formatPercent}
        onChange={(chance) => onChange({ chance: chance >= 100 ? undefined : chance })}
      />
    </>
  );
};

export { LayerSliders };
