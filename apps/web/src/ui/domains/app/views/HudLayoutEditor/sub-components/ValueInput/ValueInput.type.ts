/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { StarterRole } from '../../behavior/formula-starters';
import type { Value } from '@shared/types/hud';

/**
 * A superset of what `ValueField` and `ExpressionInput` already took, so both
 * become thin adapters and none of the ~30 call sites behind them changes.
 */
interface ValueInputProps {
  label?: string;
  /** `undefined` renders an EMPTY field, meaning an optional property with no value
   *  yet. Only a caller that also passes `onClear` should ever pass it. */
  value: Value | undefined;
  onChange: (next: Value) => void;
  /**
   * Makes the field OPTIONAL: emptying it deletes the key instead of reverting
   * to the stored value on blur. Phase 6's rule, "a limit is cleared by
   * emptying the field". `Value` has no `undefined`, so the absence lives in
   * the caller's own document shape and this is how the field says it.
   */
  onClear?: () => void;
  /** The sample state's own data scope, which the live result previews against. */
  scope: Readonly<Record<string, number>>;
  /** Whether `index`/`count`/`item` are names here. */
  insideRepeat?: boolean;
  /** Only valid at `transition.when`'s one call site, for its `delta`. */
  extraNames?: readonly string[];
  /**
   * Which worked starting points to offer. A `count` is never offered a
   * comparison and a `when` is never offered a fraction.
   */
  role?: StarterRole;
  /** Bounds for the stepper, and for the "valid but out of range" warning. */
  min?: number;
  max?: number;
  step?: number;
  /** States the consequence of leaving it blank, such as `none`, `auto` or `0`. */
  placeholder?: string;
  hint?: ReactNode;
  /** State 6: the panel derived this, or another section owns it. */
  readOnly?: boolean;
  /** Where a read-only number comes from, and the way back to editing it. */
  derivedFrom?: string;
  className?: string;
  'aria-label'?: string;
}

export type { ValueInputProps };
