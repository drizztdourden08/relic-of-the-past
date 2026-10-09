/* @layer renderer-widgets @kind types */
type ControlGlyphKind = 'mouse-left' | 'mouse-right' | 'wheel' | 'key';

type ControlHint = {
  glyph: ControlGlyphKind;
  keyName?: string;
  label: string;
};

type ControlGlyphProps = {
  kind: ControlGlyphKind;
  keyName?: string;
};

type ControlLegendProps = {
  items: readonly ControlHint[];
};

export type { ControlGlyphKind, ControlGlyphProps, ControlHint, ControlLegendProps };
