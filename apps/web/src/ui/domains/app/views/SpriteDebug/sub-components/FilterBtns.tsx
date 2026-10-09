/* @layer renderer-components @kind component */
import { SegmentedControl } from '@drizztdourden08/tessera/primitives';
import type { ReviewStatus } from '../SpriteDebug.type';
import { FILTER_OPTIONS } from '../SpriteDebug.constants';

const FilterBtns = ({ filter, setFilter }: { filter: 'all' | ReviewStatus; setFilter: (v: 'all' | ReviewStatus) => void }) => (
  <SegmentedControl size="sm" value={filter} options={FILTER_OPTIONS} onChange={setFilter} />
);

export { FilterBtns };
