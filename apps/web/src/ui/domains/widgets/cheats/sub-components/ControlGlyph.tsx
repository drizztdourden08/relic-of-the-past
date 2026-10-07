/* @layer renderer-widgets @kind component */
/**
 * The picture of an input: a mouse with the pressed part filled (left button, right button,
 * wheel) or a key cap with its name. Used by the legend under a tab and by the hint that
 * follows the pointer, so both say "right click" with the same drawing.
 */
import { Box, Icon, Text } from '@ds/primitives';
import type { ControlGlyphKind } from './ControlGlyph.type';

/** A mouse outline, 16 by 16, with the two button dividers. */
const MOUSE_OUTLINE = [
  'M8 1.5C5.5 1.5 4 3.3 4 5.5v5c0 2.2 1.5 4 4 4s4-1.8 4-4v-5c0-2.2-1.5-4-4-4Z',
  'M8 1.5v5',
  'M4 6.5h8',
];

/** The filled part per glyph: the pressed button or the wheel. */
const MOUSE_FILL: Record<'mouse-left' | 'mouse-right' | 'wheel', string[]> = {
  'mouse-left': ['M7.3 2.2C5.4 2.5 4.7 4 4.7 5.5v0.3h2.6V2.2Z'],
  'mouse-right': ['M8.7 2.2c1.9 0.3 2.6 1.8 2.6 3.3v0.3H8.7V2.2Z'],
  wheel: ['M7.2 3h1.6v2.8H7.2Z'],
};

const ICON_SIZE = 16;

type ControlGlyphProps = {
  kind: ControlGlyphKind;
  /** The key's name, for `kind: 'key'`. */
  keyName?: string;
};

const ControlGlyph = ({ kind, keyName }: ControlGlyphProps) => {
  if (kind === 'key') return <Text as="kbd" className="cheats-glyph cheats-glyph--key">{keyName}</Text>;
  return (
    <Box as="span" className="cheats-glyph cheats-glyph--mouse" aria-hidden="true">
      <Icon paths={MOUSE_OUTLINE} size={ICON_SIZE} fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" />
      <Icon paths={MOUSE_FILL[kind]} size={ICON_SIZE} />
    </Box>
  );
};

export { ControlGlyph };
export type { ControlGlyphProps };
