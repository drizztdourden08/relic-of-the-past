/* @layer renderer-components @kind component */
import { SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { CrossfadeField } from '../../CrossfadeField';
import { ORDER_HINTS, ORDER_OPTIONS } from '../PlayModeFields.constants';
import type { LoopFieldsProps } from './LoopFields.type';

const LoopFields = (props: LoopFieldsProps) => {
  const { mode, layerId, disabled, onChange } = props;
  return (
    <>
      <SegmentedControl
        label="Order"
        description={ORDER_HINTS[mode.order]}
        value={mode.order}
        options={ORDER_OPTIONS}
        disabled={disabled}
        onChange={(order) => onChange({ ...mode, order })}
      />
      {mode.order !== 'single' && (
        <CrossfadeField
          seconds={mode.crossfadeSeconds ?? 0}
          layerId={layerId}
          disabled={disabled}
          onChange={(crossfadeSeconds) => onChange({ ...mode, crossfadeSeconds })}
        />
      )}
    </>
  );
};

export { LoopFields };
