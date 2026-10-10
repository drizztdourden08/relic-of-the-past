/* @layer renderer-widgets @kind component */
import type { ScreenCrossing } from '@rotp/game-core';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { ReqIcon } from './ReqIcon';
import { EdgeArrowSvg } from './EdgeArrowSvg';
import type { EdgeCardProps } from './EdgeCard.type';
import './EdgeCard.css';

const spanOf = (crossing: ScreenCrossing): string => {
  if (!crossing.span) return '';
  const axis = crossing.side === 'north' || crossing.side === 'south' ? 'c' : 'r';
  return `${axis}${crossing.span.from}-${crossing.span.to}`;
};

const tilesOf = (span: ScreenCrossing['span']): string =>
  span === undefined ? '' : `${span.freeTiles}${span.itemTiles > 0 ? `+${span.itemTiles}` : ''}`;

const EdgeCard = ({ row, screenBundle, isIndoors, playerLayer }: EdgeCardProps) => {
  const { crossing, sourceScreen } = row;
  const fromLabel = screenBundle?.isMulti ? ` (${screenBundle.subNames[sourceScreen] ?? ''})` : '';
  const span = spanOf(crossing);
  const tiles = tilesOf(crossing.span);
  const toggles = crossing.layerToggle === true;
  const targetLayer = toggles && playerLayer != null ? (playerLayer === 0 ? '→ Lower' : '→ Upper') : null;
  return (
    <Box className={crossing.available ? 'nav-conn-card' : 'nav-conn-card nav-edge-card--blocked'} title={crossing.arrival ?? crossing.id}>
      <Box className="nav-conn-header">
        <EdgeArrowSvg edge={crossing.side ?? 'east'} size={16} />
        <Text className="nav-conn-title">{crossing.label}{fromLabel}</Text>
        {!crossing.available && <Text className="nav-edge-card__blocked-tag">blocked</Text>}
        {span && <Text style={{ fontFamily: '\'JetBrains Mono\', monospace' }} className="nav-edge-card__part-1">{span}</Text>}
        {tiles && <Text style={{ fontFamily: '\'JetBrains Mono\', monospace' }} className="nav-edge-card__part-1">{tiles}</Text>}
      </Box>
      {isIndoors && (
        <Box className={toggles ? 'nav-edge-card__layer-row nav-val-info' : 'nav-edge-card__layer-row nav-val-green'}>
          {toggles
            ? <>▲▼ Layer Toggle {targetLayer && <Text className="nav-edge-card__layer-target">{targetLayer}</Text>}</>
            : <>═ No Layer Change</>}
        </Box>
      )}
      {crossing.requirements.length > 0 && (
        <Box className="nav-meta">{crossing.requirements.map(req => <ReqIcon key={req} req={req} />)}</Box>
      )}
    </Box>
  );
};

export { EdgeCard };
