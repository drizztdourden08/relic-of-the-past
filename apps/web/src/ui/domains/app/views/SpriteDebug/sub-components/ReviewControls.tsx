/* @layer renderer-components @kind component */
import type { CSSProperties } from 'react';
import { Box, Text, Button } from '../../../../../design-system/primitives';
import type { ReviewStatus } from '../SpriteDebug.type';
import { S } from '../SpriteDebug.constants';

const L: Record<string, CSSProperties> = {
  good: { color: 'var(--c-green-bright)' },
  warn: { color: 'var(--c-warning)' },
  dim: { color: 'var(--c-text-dim)' },
  danger: { color: 'var(--c-danger)' },
  muted: { color: 'var(--c-text-muted)' },
  count: { opacity: 0.5, fontSize: 10 },
};

const Stats = ({ counts, total }: { counts: { good: number; neutral: number; bad: number; yellow: number }; total: number }) => {
  return (
    <Box style={S.stats}>
      <Text style={L.good}>{counts.good} good</Text>
      <Text style={L.warn}>{counts.yellow} re-review</Text>
      <Text style={L.dim}>{counts.neutral} unchecked</Text>
      <Text style={L.danger}>{counts.bad} bad</Text>
      <Text style={L.muted}>/ {total}</Text>
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
          <Button variant="bare" key={v} onClick={() => setFilter(v)} style={{ ...S.filterBtn, ...(active ? S.filterBtnActive : {}) }}>
            {label}
          </Button>
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
    <Button variant="bare" onClick={() => onClick(value)} style={{ ...S.catTab, ...(active ? S.catTabActive : {}) }}>
      {label} <Text style={L.count}>({count})</Text>
    </Button>
  );
};

const StatusBtns = ({ current, onClick }: { current: ReviewStatus; onClick: (s: ReviewStatus) => void }) => {
  return (
    <Box style={S.statusBtns}>
      {([['✓', 'good', 'var(--c-green-bright)'], ['●', 'yellow', 'var(--c-warning)'], ['-', 'neutral', 'var(--c-text-muted)'], ['✗', 'bad', 'var(--c-danger)']] as const).map(([icon, st, color]) => {
        const active = current === st;
        return (
          <Button variant="bare" key={st} onClick={() => onClick(st)} style={{
            ...S.statusBtn,
            color: active ? 'var(--c-text)' : color,
            background: active ? color : 'transparent',
            borderColor: active ? color : 'var(--c-border-strong)',
          }}>
            {icon}
          </Button>
        );
      })}
    </Box>
  );
};

export { CategoryButton, FilterBtns, Stats, StatusBtns };
