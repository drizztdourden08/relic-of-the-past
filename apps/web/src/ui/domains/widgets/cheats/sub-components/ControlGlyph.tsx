/* @layer renderer-widgets @kind component */
import { Box, Icon, Text } from '@drizztdourden08/tessera/primitives';
import { ICON_SIZE, MOUSE_FILL, MOUSE_OUTLINE } from './ControlGlyph.constants';
import type { ControlGlyphProps } from './ControlGlyph.type';

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
