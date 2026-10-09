/* @layer renderer-widgets @kind component */
import { Icon } from '@iconify/react/offline';
import type { ScreenCrossing } from '@rotp/game-core';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { crossingIcon } from '@rotp/navigation';
import { S } from '../styles';
import { ReqIcon } from './ReqIcon';
import { IL } from './CrossingCard.constants';

const layerTagFor = (layer: ScreenCrossing['layer']): string | null =>
  layer === undefined ? null : (layer === 0 ? '▲ Upper' : '▼ Lower');

const CrossingCard = ({ crossing }: { crossing: ScreenCrossing }) => {
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
