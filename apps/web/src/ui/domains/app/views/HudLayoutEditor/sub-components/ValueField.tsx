/* @layer renderer-components @kind component */
/**
 * ONE control, everywhere a number is accepted. Now it is literally one control.
 *
 * WHAT THIS FILE IS AFTER PHASE 4. It used to hold the `123 | ƒx`
 * `SegmentedControl` and switch between a `NumberInput` and an
 * `ExpressionInput` behind it; `ValueInput` deletes that boundary, because
 * there was never anything on either side of it. A leading `=` says
 * "formula", and the field is always typed. What survives is the PROP SHAPE,
 * so the ~25 call sites that pass `label`/`value`/`onChange`/`scope`/
 * `insideRepeat`/`min`/`max`/`step` do not change and phase 3's
 * `<Field size="sm">` adoption is untouched.
 *
 * "PRESERVE WHAT YOU CAN" SURVIVES STRUCTURALLY. The old file seeded the
 * expression with `String(value)` one way and read the live result back the
 * other; typing `=` in front of `24` IS that seeding, and deleting the `=`
 * leaves the digits for the field to read as a numeral again. The behaviour is
 * kept; the code that implemented it is not needed.
 *
 * AND SINCE §56 IT IS THE ONE PLACE THE EDITOR'S STEP GETS IN. A number with no
 * `step` of its own moves by the context value in `editor-step.ts`, set by the
 * `STEP 1 2 4 8` strip under the preview, so a gap, a margin, an offset and a size all
 * nudge by the same amount the author chose for this session. A field that
 * passes a `step` keeps it: `opacity` is 0.05 whatever the strip says. That
 * makes the default a PROPERTY OF THE PANEL and the explicit value a PROPERTY
 * OF THE FIELD, which is the right way round. It is also why `StepNumberInput`,
 * a whole component built to carry one prop, is gone.
 */
import { useEditorStep } from '../behavior/editor-step';
import { ValueInput } from './ValueInput';
import type { Value } from '@shared/types/hud';

interface ValueFieldProps {
  label?: string;
  value: Value;
  onChange: (next: Value) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
  extraNames?: readonly string[];
  min?: number;
  max?: number;
  /** Omitted = the editor's own step (`behavior/editor-step.ts`). Pass one
   *  only for a number that is NOT in pixels, such as a fraction, a count or a
   *  millisecond, where a session-wide 8 would be nonsense. */
  step?: number;
  /** The accessible name when the visible label is a glyph in the caller's own
   *  row instead of a word above the field (§56's gap cells). */
  'aria-label'?: string;
}

const ValueField = (props: ValueFieldProps) => {
  const editorStep = useEditorStep();
  return <ValueInput {...props} step={props.step ?? editorStep} role="number" />;
};

export { ValueField };
export type { ValueFieldProps };
