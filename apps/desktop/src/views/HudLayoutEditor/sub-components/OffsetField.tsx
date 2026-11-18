/* @layer renderer-components @kind component */
import { Field } from '@drizztdourden08/tessera/primitives';
import { DynamicInput } from '@drizztdourden08/tessera/composites';
import { offsetOf, withOffset } from '@app/hud-layout-editing/offset';
import { OFFSET_PATTERN } from './OffsetField.constants';
import type { PatternSlotValue, PatternValue } from '@drizztdourden08/tessera/composites';
import type { OffsetFieldProps } from './OffsetField.type';
import { useT } from '@drizztdourden08/brock-react';

const numberOf = (slot: PatternSlotValue | undefined): number => (typeof slot === 'number' ? slot : 0);

const OffsetField = (props: OffsetFieldProps) => {
  const t = useT();
  const { value, onChange, from = t('hud-editor:offset-field.from-default') } = props;
  const slots: PatternValue = { ...offsetOf(value) };

  return (
    <Field
      size="sm"
      label={t('hud-editor:offset-field.label.offset')}
      hint={t('hud-editor:offset-field.hint', { from })}
    >
      <DynamicInput
        size="sm"
        className="hud-offset__input"
        aria-label={t('hud-editor:offset-field.aria.offset')}
        pattern={OFFSET_PATTERN}
        value={slots}
        onChange={(next) => onChange(withOffset(value, { x: numberOf(next.x), y: numberOf(next.y) }))}
      />
    </Field>
  );
};

export { OffsetField };
