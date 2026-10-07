/* @layer renderer-components @kind types */

/**
 * The density a control draws itself at.
 *
 * `md` is the tier every one of these components already draws today, and it is
 * the default everywhere. A call site that omits `size` renders exactly the
 * markup and exactly the pixels it rendered before this type existed. `md`
 * therefore emits NO class and NO attribute: it is the base rule, not a
 * modifier over it. Only `sm` adds anything.
 *
 * `sm` is the compact tier `.btn--sm` and `.select-trigger--sm` already draw
 * themselves at, extended to the primitives that never got it: 26px tall
 * (`--control-h-sm`), 4/8 padding, 11px value text, 4px radius. It exists for
 * the inspector rail, whose content column is 188px at its minimum.
 *
 * Button, IconButton, Select and Spinner each declare their own size union of
 * the same shape; they are deliberately NOT migrated onto this one here,
 * because reconciling their tiers (11px against 10px, 6px radius against 4px,
 * two hardcoded 26/34s) moves rendered pixels outside this design system and
 * belongs in the token-unification pass that follows.
 */
type ControlSize = 'sm' | 'md';

export type { ControlSize };
