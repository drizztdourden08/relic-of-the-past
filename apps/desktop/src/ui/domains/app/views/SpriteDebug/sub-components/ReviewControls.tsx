/* @layer renderer-components @kind component */
import type { ReviewStatus } from '../SpriteDebug.type';
import { S } from '../styles';

const Stats = ({ counts, total }: { counts: { good: number; neutral: number; bad: number; yellow: number }; total: number }) => {
  return (
    <div style={S.stats}>
      <span style={{ color: '#4caf50' }}>{counts.good} good</span>
      <span style={{ color: '#f5c542' }}>{counts.yellow} re-review</span>
      <span style={{ color: '#999' }}>{counts.neutral} unchecked</span>
      <span style={{ color: '#f44336' }}>{counts.bad} bad</span>
      <span style={{ color: '#666' }}>/ {total}</span>
    </div>
  );
};

const FilterBtns = ({ filter, setFilter }: { filter: 'all' | ReviewStatus; setFilter: (v: 'all' | ReviewStatus) => void }) => {
  return (
    <>
      {(['all', 'neutral', 'good', 'yellow', 'bad'] as const).map(v => {
        const label = v === 'all' ? 'All' : v === 'neutral' ? 'Unchecked' : v === 'good' ? 'Good' : v === 'yellow' ? 'Re-review' : 'Bad';
        const active = filter === v;
        return (
          <button key={v} onClick={() => setFilter(v)} style={{ ...S.filterBtn, ...(active ? S.filterBtnActive : {}) }}>
            {label}
          </button>
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
    <button onClick={() => onClick(value)} style={{ ...S.catTab, ...(active ? S.catTabActive : {}) }}>
      {label} <span style={{ opacity: 0.5, fontSize: 10 }}>({count})</span>
    </button>
  );
};

const StatusBtns = ({ current, onClick }: { current: ReviewStatus; onClick: (s: ReviewStatus) => void }) => {
  return (
    <div style={S.statusBtns}>
      {([['✓', 'good', '#4caf50'], ['●', 'yellow', '#f5c542'], ['—', 'neutral', '#888'], ['✗', 'bad', '#f44336']] as const).map(([icon, st, color]) => {
        const active = current === st;
        return (
          <button key={st} onClick={() => onClick(st)} style={{
            ...S.statusBtn,
            color: active ? '#fff' : color,
            background: active ? color : 'transparent',
            borderColor: active ? color : 'rgba(255,255,255,0.15)',
          }}>
            {icon}
          </button>
        );
      })}
    </div>
  );
};

export { CategoryButton, FilterBtns, Stats, StatusBtns };
