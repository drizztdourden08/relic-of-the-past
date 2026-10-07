/* @layer sanctuary-site @kind component */
/** The picked files as tiles, three to a row; past the cap, one last tile counts the rest. */
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import { Flex } from '@ds/primitives/Flex';
import { Grid } from '@ds/primitives/Grid';
import { Text } from '@ds/primitives/Text';
import { SELECTION_TILE_MAX } from '../Files.constants';
import { SelectionTile } from './SelectionTile';

type SelectionGridProps = {
  files: readonly SanctuaryFile[];
};

const GRID_COLUMNS = 3;

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
export type { SelectionGridProps };
