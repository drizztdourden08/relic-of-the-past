/* @layer renderer-components @kind component */
import { Box, Button, ButtonRow, EmptyState, Text } from '@drizztdourden08/tessera/primitives';
import { NAMING_COPY } from './GlyphNamingGrid.constants';
import type { GlyphNamingGridProps } from './GlyphNamingGrid.type';
import { GlyphNamingCell } from './sub-components/GlyphNamingCell';
import './GlyphNamingGrid.css';

const GlyphNamingGrid = (props: GlyphNamingGridProps) => {
  const { items, names, problems, tiles, readOnly, canSave, onNameChange, onSave } = props;
  if (items.length === 0) return <EmptyState message={NAMING_COPY.empty} />;

  return (
    <Box className="glyph-naming">
      <Text variant="caption">{NAMING_COPY.intro}</Text>
      <Box className="glyph-naming__grid" role="list">
        {items.map((item) => (
          <GlyphNamingCell
            key={item.token}
            item={item}
            name={names[item.token] ?? ''}
            problem={problems[item.token]}
            tiles={tiles}
            readOnly={readOnly}
            onNameChange={onNameChange}
          />
        ))}
      </Box>
      <ButtonRow>
        <Button size="sm" disabled={!canSave} onClick={onSave}>{NAMING_COPY.save}</Button>
      </ButtonRow>
    </Box>
  );
};

export { GlyphNamingGrid };
