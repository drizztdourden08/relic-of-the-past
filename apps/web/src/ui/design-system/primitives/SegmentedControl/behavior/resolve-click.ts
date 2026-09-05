/* @layer renderer-components @kind logic */
/**
 * What clicking a segment resolves to. Re-clicking the already-active segment
 * only clears the field when the caller wired a deselect handler. Its presence
 * is the opt-in, so a required field (no handler passed) keeps
 * calling onChange with the value it already holds, exactly as before.
 */
type ClickOutcome<T extends string> =
  | { kind: 'change'; value: T }
  | { kind: 'deselect' };

const resolveClick = <T extends string>(
  optionValue: T,
  activeValue: T,
  canDeselect: boolean,
): ClickOutcome<T> =>
  (optionValue === activeValue && canDeselect)
    ? { kind: 'deselect' }
    : { kind: 'change', value: optionValue };

export { resolveClick };
export type { ClickOutcome };
