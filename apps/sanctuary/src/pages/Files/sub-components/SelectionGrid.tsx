/* @layer sanctuary-site @kind component */
import { Flex, Grid, Text } from '@drizztdourden08/tessera/primitives';
import { SELECTION_TILE_MAX } from '../Files.constants';
import { SelectionTile } from './SelectionTile';
import { GRID_COLUMNS } from './SelectionGrid.constants';
import type { SelectionGridProps } from './SelectionGrid.type';

const SelectionGrid = (props: SelectionGridProps) => {
  const { files } = props;
  const overflow = files.length > SELECTION_TILE_MAX;
  const shown = overflow ? files.slice(0, SELECTION_TILE_MAX - 1) : files;
  const rest = files.length - shown.length;

  return (
    <Grid columns={GRID_COLUMNS} gap="sm" className="selection-grid">
      {shown.map((file) => <SelectionTile key={file.id} file={file} />)}
      {overflow && (
        <Flex align="center" justify="center" className="selection-tile__well selection-grid__more">
          <Text as="span" variant="caption">+{rest} more</Text>
        </Flex>
      )}
    </Grid>
  );
};

export { SelectionGrid };
