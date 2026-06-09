/* @layer renderer-components @kind component */
import { Box, Text } from '../../../../../design-system/primitives';
import type { ReviewStatus } from '../SpriteDebug.type';
import { S } from '../SpriteDebug.constants';

const Stats = ({ counts, total }: { counts: { good: number; neutral: number; bad: number; yellow: number }; total: number }) => {
  return (
    <Box style={S.stats}>
      <Text style={{ color: 'var(--c-green-bright)' }}>{counts.good} good</Text>
      <Text style={{ color: 'var(--c-warning)' }}>{counts.yellow} re-review</Text>
      <Text style={{ color: 'var(--c-text-dim)' }}>{counts.neutral} unchecked</Text>
      <Text style={{ color: 'var(--c-danger)' }}>{counts.bad} bad</Text>
      <Text style={{ color: 'var(--c-text-muted)' }}>/ {total}</Text>
    </Box>
  );
};

const FilterBtns = ({ filter, setFilter }: { filter: 'all' | ReviewStatus; setFilter: (v: 'all' | ReviewStatus) => void }) => {
  return (
    <>
      {(['all', 'neutral', 'good', 'yellow', 'bad'] as const).map(v => {
        const label = v === 'all' ? 'All' : v === 'neutral' ? 'Unchecked' : v === 'good' ? 'Good' : v === 'yellow' ? 'Re-review' : 'Bad';
        const active = filter === v;
        return (
          <Box as="button" key={v} onClick={() => setFilter(v)} style={{ ...S.filterBtn, ...(active ? S.filterBtnActive : {}) }}>
            {label}
          </Box>
        );
      })}
    </>
  );
};

const CategoryButton = ({ label, value, current, onClick, count }: {
  label: string; value: string; current: string; onClick: (v: string) => void; count: number;
}) => {
  const active = current === value;
  return (
    <Box as="button" onClick={() => onClick(value)} style={{ ...S.catTab, ...(active ? S.catTabActive : {}) }}>
      {label} <Text style={{ opacity: 0.5, fontSize: 10 }}>({count})</Text>
    </Box>
  );
};

const StatusBtns = ({ current, onClick }: { current: ReviewStatus; onClick: (s: ReviewStatus) => void }) => {
  return (
    <Box style={S.statusBtns}>
      {([['✓', 'good', 'var(--c-green-bright)'], ['●', 'yellow', 'var(--c-warning)'], ['—', 'neutral', 'var(--c-text-muted)'], ['✗', 'bad', 'var(--c-danger)']] as const).map(([icon, st, color]) => {
        const active = current === st;
        return (
          <Box as="button" key={st} onClick={() => onClick(st)} style={{
            ...S.statusBtn,
            color: active ? 'var(--c-text)' : color,
            background: active ? color : 'transparent',
            borderColor: active ? color : 'var(--c-border-strong)',
          }}>
            {icon}
          </Box>
        );
      })}
    </Box>
  );
};

export { CategoryButton, FilterBtns, Stats, StatusBtns };
