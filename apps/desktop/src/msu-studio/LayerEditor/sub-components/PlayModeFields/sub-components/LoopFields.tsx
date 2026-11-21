/* @layer renderer-components @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { SegmentedControl } from '@drizztdourden08/tessera/primitives';
import { CrossfadeField } from '../../CrossfadeField';
import { ORDER_HINTS, ORDER_KINDS, ORDER_LABELS } from '../PlayModeFields.constants';
import type { LoopFieldsProps } from './LoopFields.type';

const LoopFields = (props: LoopFieldsProps) => {
  const { mode, layerId, disabled, onChange } = props;
  const t = useT();
  const text = useText();
  const options = ORDER_KINDS.map((order) => ({ value: order, label: text(ORDER_LABELS[order]) }));
  return (
    <>
      <SegmentedControl
        label={t('msu-studio:layers.order.label')}
        description={text(ORDER_HINTS[mode.order])}
        value={mode.order}
        options={options}
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
