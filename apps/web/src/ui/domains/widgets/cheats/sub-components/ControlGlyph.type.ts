/* @layer renderer-widgets @kind types */

/** The inputs a control can ask for. */
type ControlGlyphKind = 'mouse-left' | 'mouse-right' | 'wheel' | 'key';

/** One line of a legend or a pointer hint: the input, then what it does. */
type ControlHint = {
  glyph: ControlGlyphKind;
  /** The key's name, for `glyph: 'key'`. */
  keyName?: string;
  label: string;
};

export type { ControlGlyphKind, ControlHint };
