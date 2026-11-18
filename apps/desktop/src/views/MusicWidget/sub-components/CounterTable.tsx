/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import { Box, ScrollArea, Text } from '@drizztdourden08/tessera/primitives';
import type { MusicDebugCounter } from '@rotp/msu';
import { useStableOrder } from '../behavior/useStableOrder';
import './CounterTable.css';

const splitOf = (t: I18n['t'], row: MusicDebugCounter): string => {
  if (row.skipped > 0 || row.key.startsWith('roll:')) {
    const percent = row.raised > 0 ? Math.round((row.pack / row.raised) * 100) : 0;
    return t('views-music:counters.split.played', { pack: row.pack, raised: row.raised, percent });
  }
  if (row.pack > 0 && row.chip === 0) return t('views-music:counters.split.pack', { count: row.raised });
  if (row.chip > 0 && row.pack === 0) return t('views-music:counters.split.chip', { count: row.raised });
  return t('views-music:counters.split.mixed', { pack: row.pack, chip: row.chip });
};

const CounterTable = (props: { counters: MusicDebugCounter[] }) => {
  const t = useT();
  const rows = useStableOrder(props.counters);

  return (
    <ScrollArea className="counter-table" fade={false}>
      {rows.length === 0 && (
        <Box className="music-row counter-table__row" data-empty="yes">
          <Text className="counter-table__label">{t('views-music:counters.empty')}</Text>
        </Box>
      )}
      {rows.map((row) => (
        <Box key={row.key} className="music-row counter-table__row">
          <Text className="counter-table__label" title={`${row.channel} · ${row.label}`}>{`${row.channel} · ${row.label}`}</Text>
          <Text className="counter-table__value">{splitOf(t, row)}</Text>
        </Box>
      ))}
    </ScrollArea>
  );
};

export { CounterTable };
