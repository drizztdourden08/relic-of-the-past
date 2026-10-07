/* @layer renderer-components @kind component */
/**
 * Which sides a border draws on, as `HudBorderSides` (`hud-style.ts`). Absent
 * means every side, so an author who never opens this sees a plain border on
 * all four exactly as before; unchecking one leaves the other three.
 *
 * NOT `EdgesInput`, which edits four independent NUMBERS (margin,
 * padding); this edits four independent BOOLEANS. Same idea (one control per
 * side), a different field shape, so this stays its own small component
 * instead of `EdgesInput` growing a mode switch between the two.
 */
import { Checkbox } from '@ds/primitives/Checkbox';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import type { HudBorderSides } from '@shared/types/hud';

type Side = keyof HudBorderSides;
const SIDES: readonly Side[] = ['top', 'right', 'bottom', 'left'];

interface EdgesFieldProps {
  label: string;
  value: HudBorderSides | undefined;
  onChange: (next: HudBorderSides | undefined) => void;
}

const EdgesField = (props: EdgesFieldProps) => {
  const { label, value, onChange } = props;

  const setSide = (side: Side, on: boolean): void => {
    // Absent = every side, so the FIRST uncheck has to seed the other three as
    // explicitly on instead of silently narrowing from "everything" to "just
    // this one is off, and the rest are... also off".
    const base: HudBorderSides = value ?? { top: true, right: true, bottom: true, left: true };
    const next = { ...base, [side]: on };
    const allOn = SIDES.every((s) => next[s] !== false);
    onChange(allOn ? undefined : next);
  };

  return (
    <Field size="sm" label={label} className="hud-edges-field">
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
export type { EdgesFieldProps };
