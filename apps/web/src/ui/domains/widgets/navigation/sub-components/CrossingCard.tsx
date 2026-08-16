/* @layer renderer-widgets @kind component */
import type { CSSProperties } from 'react';
import { Icon } from '@iconify/react/offline';
import type { ScreenCrossing } from '@shared/game/navigation';
import { Box, Text } from '../../../../design-system/primitives';
import { crossingIcon } from '../../../../../lib/entrance-icons';
import { S } from '../styles';
import { ReqIcon } from './ReqIcon';

const IL: Record<string, CSSProperties> = {
  reqRow: { display: 'flex', gap: 2, marginTop: 2 },
  blocked: { opacity: 0.55, borderColor: 'var(--c-warning)' },
  blockedTag: { fontSize: 8, color: 'var(--c-warning)', marginTop: 1 },
  layerTag: { fontSize: 8, color: 'var(--c-info)', marginTop: 1 },
};

interface Props {
  crossing: ScreenCrossing;
}

/** The floor the crossing sits on, when the record names one. */
const layerTagFor = (layer: ScreenCrossing['layer']): string | null =>
  layer === undefined ? null : (layer === 0 ? '▲ Upper' : '▼ Lower');

/** One way on or off the screen. A crossing the player cannot take is marked, not hidden. */
const CrossingCard = ({ crossing }: Props) => {
  const { icon, color } = crossingIcon(crossing);
  const layerTag = layerTagFor(crossing.layer);
  return (
    <Box style={crossing.available ? S.card : { ...S.card, ...IL.blocked }} title={`${crossing.id} · ${crossing.origin}`}>
      <Box style={S.cardGraphic}>
        <Icon icon={icon} width={28} height={28} style={{ color }} />
      </Box>
      <Text style={S.cardTitle}>{crossing.label}</Text>
      <Text style={S.cardSub}>r{crossing.tile.row} c{crossing.tile.col}</Text>
      {layerTag && <Text style={IL.layerTag}>{layerTag}</Text>}
      {!crossing.available && <Text style={IL.blockedTag}>blocked</Text>}
      {crossing.requirements.length > 0 && (
        <Box style={IL.reqRow}>{crossing.requirements.map(req => <ReqIcon key={req} req={req} />)}</Box>
      )}
    </Box>
  );
};

export { CrossingCard };
