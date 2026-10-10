/* @layer renderer-widgets @kind component */
import { Icon } from '@iconify/react/offline';
import type { ScreenCrossing } from '@rotp/game-core';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { crossingIcon } from '@rotp/navigation';
import { ReqIcon } from './ReqIcon';
import './CrossingCard.css';

const layerTagFor = (layer: ScreenCrossing['layer']): string | null =>
  layer === undefined ? null : (layer === 0 ? '▲ Upper' : '▼ Lower');

const CrossingCard = ({ crossing }: { crossing: ScreenCrossing }) => {
  const { icon, color } = crossingIcon(crossing);
  const layerTag = layerTagFor(crossing.layer);
  return (
    <Box className={crossing.available ? 'nav-card' : 'nav-card nav-crossing-card--blocked'} title={`${crossing.id} · ${crossing.origin}`}>
      <Box className="nav-card-graphic">
        <Icon icon={icon} width={28} height={28} style={{ color }} />
      </Box>
      <Text className="nav-card-title">{crossing.label}</Text>
      <Text className="nav-card-sub">r{crossing.tile.row} c{crossing.tile.col}</Text>
      {layerTag && <Text className="nav-crossing-card__layer-tag">{layerTag}</Text>}
      {!crossing.available && <Text className="nav-crossing-card__blocked-tag">blocked</Text>}
      {crossing.requirements.length > 0 && (
        <Box className="nav-crossing-card__req-row">{crossing.requirements.map(req => <ReqIcon key={req} req={req} />)}</Box>
      )}
    </Box>
  );
};

export { CrossingCard };
