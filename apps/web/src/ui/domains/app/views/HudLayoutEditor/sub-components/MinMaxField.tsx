/* @layer renderer-components @kind component */
/**
 * A FLOOR AND A CEILING ON EACH AXIS, as two optional ranges in two rows.
 *
 * What it replaces: two separate `min` and `max` groups, four checkboxes and
 * four sentences, with the copy inconsistent between the `w` and `h` rows of
 * the same group. A checkbox in front of a field is a second way to say the
 * one thing the field itself can already say.
 *
 * A LIMIT IS CLEARED BY EMPTYING THE FIELD, and this is where that rule finally
 * lands. §36.9 could not implement it: `Value` has no `undefined`, so a phase-4
 * field reverted to the document value on blur. `ValueInput` now takes an
 * `onClear`, and what an emptied field does here is stated exactly:
 *
 *   THE KEY GETS DELETED. Not zeroed, because `min.w = 0` is a real constraint that
 *   pins a `fill` child open at nothing, and it is not what "no minimum" means.
 *   Not remembered either: an emptied limit leaves the document byte-identical
 *   to one that never had it, which is what makes an accidental glance at this
 *   section free. Emptying BOTH axes deletes `min` (or `max`) itself, the same
 *   `compact` rule every other optional group in this panel follows.
 *
 * A limit may still be a formula, because it always could be: typing `=` in
 * either field works exactly as it does everywhere else.
 */
import { Box } from '@ds/primitives/Box';
import { Field } from '@ds/primitives/Field';
import { Text } from '@ds/primitives/Text';
import { useEditorStep } from '../behavior/editor-step';
import { ValueInput } from './ValueInput';
import type { Value } from '@shared/types/hud';

type Limits = { w?: Value; h?: Value } | undefined;

interface MinMaxFieldProps {
  min: Limits;
  max: Limits;
  onMin: (next: Limits) => void;
  onMax: (next: Limits) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
}

const AXES = ['w', 'h'] as const;

/**
 * A group with neither axis left in it is `undefined`, and a cleared axis is
 * DELETED, not set to `undefined`. `{ w: undefined, h: 4 }` and `{ h: 4 }` are
 * the same object in TypeScript and different documents on disk: the first
 * round-trips through JSON as a `w` key. The test asserts `'w' in next` is
 * false for exactly this reason.
 */
const compact = (next: { w?: Value; h?: Value }): Limits => {
  const out: { w?: Value; h?: Value } = {};
  if (next.w !== undefined) out.w = next.w;
  if (next.h !== undefined) out.h = next.h;
  return out.w === undefined && out.h === undefined ? undefined : out;
};

const MinMaxField = (props: MinMaxFieldProps) => {
  const { min, max, onMin, onMax, scope, insideRepeat } = props;
  // A limit is a size in HUD pixels, so it moves by the editor's step (§56).
  const step = useEditorStep();

  const bounds = [
    { key: 'min' as const, value: min, set: onMin },
    { key: 'max' as const, value: max, set: onMax },
  ];

  return (
    <Field size="sm" label="limits" hint="Leave a field blank for no limit." className="hud-minmax">
      {AXES.map((axis) => (
        <Box key={axis} className="hud-minmax__row">
          <Text className="hud-minmax__cap">{axis}</Text>
          {bounds.map((bound) => (
            <ValueInput
              key={bound.key}
              className="hud-minmax__value"
              aria-label={`${bound.key} ${axis}`}
              placeholder={bound.key}
              value={bound.value?.[axis]}
              onChange={(next) => bound.set(compact({ ...bound.value, [axis]: next }))}
              onClear={() => bound.set(compact({ ...bound.value, [axis]: undefined }))}
              scope={scope}
              insideRepeat={insideRepeat}
              role="number"
              step={step}
            />
          ))}
        </Box>
      ))}
    </Field>
  );
};

export { MinMaxField };
export type { MinMaxFieldProps };
