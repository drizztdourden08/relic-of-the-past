/* @layer renderer-widgets @kind component */
/**
 * Running totals per sound and per roll, most recent first. This is the "how often" answer the
 * feed's single lines cannot give. A chance layer reads directly as tried-versus-played, so 10% authored
 * odds landing at 3 of 31 is visible as exactly that.
 */
import { Box, EmptyState, StatRow } from '@ds/primitives';
import type { MusicDebugCounter } from '@app/lib/game/music-debug';

/** How the row's raises split. A roll row reads played/skipped; a sound row reads MSU/chip. */
const splitOf = (row: MusicDebugCounter): string => {
  if (row.skipped > 0 || row.key.startsWith('roll:')) {
    const percent = row.raised > 0 ? Math.round((row.pack / row.raised) * 100) : 0;
    return `${row.pack}/${row.raised} played (${percent}%)`;
  }
  if (row.pack > 0 && row.chip === 0) return `${row.raised}× MSU`;
  if (row.chip > 0 && row.pack === 0) return `${row.raised}× chip`;
  return `${row.pack}× MSU, ${row.chip}× chip`;
};

const CounterTable = (props: { counters: MusicDebugCounter[] }) => {
  const { counters } = props;
  if (counters.length === 0) return <EmptyState message="Nothing counted yet." />;
  return (
    <Box className="music-widget__rows music-widget__rows--scroll">
      {counters.map((row) => (
        <StatRow key={row.key} label={`${row.channel} · ${row.label}`} value={splitOf(row)} mono />
      ))}
    </Box>
  );
};

export { CounterTable };
