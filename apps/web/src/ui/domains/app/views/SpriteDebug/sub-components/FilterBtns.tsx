/* @layer renderer-components @kind component */
import { Button } from '@drizztdourden08/tessera/primitives';
import type { ReviewStatus } from '../SpriteDebug.type';
import { S } from '../SpriteDebug.constants';

const FilterBtns = ({ filter, setFilter }: { filter: 'all' | ReviewStatus; setFilter: (v: 'all' | ReviewStatus) => void }) => {
  return (
    <>
      {(['all', 'neutral', 'good', 'yellow', 'bad'] as const).map(v => {
        const label = v === 'all' ? 'All' : v === 'neutral' ? 'Unchecked' : v === 'good' ? 'Good' : v === 'yellow' ? 'Re-review' : 'Bad';
        const active = filter === v;
        return (
          <Button variant="bare" key={v} onClick={() => setFilter(v)} style={{ ...S.filterBtn, ...(active ? S.filterBtnActive : {}) }}>
            {label}
          </Button>
        );
      })}
    </>
  );
};

export { FilterBtns };
