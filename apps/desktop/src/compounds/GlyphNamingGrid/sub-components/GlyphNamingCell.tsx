/* @layer renderer-components @kind component */
import { Box, Canvas, Field, Text, TextInput } from '@drizztdourden08/tessera/primitives';
import { useGlyphCanvas } from '@rotp/design/packs';
import type { GlyphNamingCellProps } from '../GlyphNamingGrid.type';

const GlyphNamingCell = (props: GlyphNamingCellProps) => {
  const { item, name, problem, tiles, readOnly, onNameChange } = props;
  const ref = useGlyphCanvas(tiles, item.glyph);

  return (
    <Box className="glyph-naming__cell" role="listitem">
      <Box as="span" className="glyph-char glyph-naming__picture" aria-hidden="true">
        <Canvas ref={ref} className="glyph-char__ink" />
      </Box>
      <Field label={item.token} error={problem}>
        <TextInput
          size="sm"
          value={name}
          maxLength={2}
          invalid={problem !== undefined}
          disabled={readOnly}
          onChange={(event) => onNameChange(item.token, event.currentTarget.value)}
        />
      </Field>
      <Text variant="caption">{item.count === 1 ? '1 use' : `${item.count} uses`}</Text>
    </Box>
  );
};

export { GlyphNamingCell };
