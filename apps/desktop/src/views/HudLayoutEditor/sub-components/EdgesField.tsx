/* @layer renderer-components @kind component */
import { Checkbox, Field, Flex } from '@drizztdourden08/tessera/primitives';
import { SIDES } from './EdgesField.constants';
import type { HudBorderSides } from '@rotp/hud';
import type { BorderSide, EdgesFieldProps } from './EdgesField.type';

const EdgesField = (props: EdgesFieldProps) => {
  const { label, value, onChange } = props;

  const setSide = (side: BorderSide, on: boolean): void => {
    const base: HudBorderSides = value ?? { top: true, right: true, bottom: true, left: true };
    const next = { ...base, [side]: on };
    const allOn = SIDES.every((s) => next[s] !== false);
    onChange(allOn ? undefined : next);
  };

  return (
    <Field size="sm" label={label}>
      <Flex gap="2xs" align="center" className="hud-edges-field__row">
        {SIDES.map((side) => (
          <Checkbox
            key={side}
            size="sm"
            label={side}
            ariaLabel={`${label} ${side}`}
            checked={value ? value[side] !== false : true}
            onChange={(on) => setSide(side, on)}
          />
        ))}
      </Flex>
    </Field>
  );
};

export { EdgesField };
