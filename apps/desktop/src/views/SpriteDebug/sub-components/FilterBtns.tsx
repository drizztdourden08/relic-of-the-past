/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { SegmentedControl } from '@drizztdourden08/tessera/primitives';
import type { ReviewStatus } from '../SpriteDebug.type';
import { filterOptionsOf } from '../SpriteDebug.constants';

const FilterBtns = ({ filter, setFilter }: { filter: 'all' | ReviewStatus; setFilter: (v: 'all' | ReviewStatus) => void }) => {
  const t = useT();
  return <SegmentedControl size="sm" value={filter} options={filterOptionsOf(t)} onChange={setFilter} />;
};

export { FilterBtns };
