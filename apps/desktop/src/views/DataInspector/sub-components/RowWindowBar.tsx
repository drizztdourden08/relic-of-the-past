/* @layer renderer-app @kind component */
import { Box, Button, Text } from '@drizztdourden08/tessera/primitives';
import { ROW_PAGE_SIZE } from '../DataInspector.constants';

interface RowWindowBarProps {
  shown: number;
  total: number;
  onShowMore: () => void;
  onShowAll: () => void;
}

const RowWindowBar = (props: RowWindowBarProps) => {
  const { shown, total, onShowMore, onShowAll } = props;
  if (shown >= total) return null;
  const next = Math.min(ROW_PAGE_SIZE, total - shown);

  return (
    <Box className="data-inspector__window">
      <Text variant="caption" tone="muted" numeric>{`Showing ${shown} of ${total}`}</Text>
      <Button variant="tertiary" size="sm" onClick={onShowMore}>{`Show ${next} more`}</Button>
      <Button variant="ghost" size="sm" onClick={onShowAll}>Show all</Button>
    </Box>
  );
};

export { RowWindowBar };
