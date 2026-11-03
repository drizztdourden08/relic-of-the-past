/* @layer renderer-components @kind component */
import { Box, Button } from '@drizztdourden08/tessera/primitives';
import type { ReviewHeaderProps } from '../SpriteDebug.type';
import { FilterBtns } from './FilterBtns';
import { ReviewStats } from './ReviewStats';

const ReviewHeader = ({ counts, total, filter, setFilter, onReset, tabs }: ReviewHeaderProps) => (
  <Box className="sprite-debug-header">
    {tabs}
    <ReviewStats counts={counts} total={total} />
    <Box className="sprite-debug-header-buttons">
      <FilterBtns filter={filter} setFilter={setFilter} />
      <Button variant="danger" size="xs" onClick={onReset}>Reset</Button>
    </Box>
  </Box>
);

export { ReviewHeader };
