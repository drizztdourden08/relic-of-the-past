/* @layer renderer-widgets @kind component */
import type { ScreenCrossing } from '@rotp/game-core';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { S } from '../styles';
import { ReqIcon } from './ReqIcon';
import { EdgeArrowSvg } from './EdgeArrowSvg';
import { IL } from './EdgeCard.constants';
import type { EdgeCardProps } from './EdgeCard.type';

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
    <Box style={crossing.available ? S.connCard : { ...S.connCard, ...IL.blocked }} title={crossing.arrival ?? crossing.id}>
      <Box style={S.connHeader}>
        <EdgeArrowSvg edge={crossing.side ?? 'east'} size={16} />
        <Text style={S.connTitle}>{crossing.label}{fromLabel}</Text>
        {!crossing.available && <Text style={IL.blockedTag}>blocked</Text>}
        {span && <Text style={S.dimBadge}>{span}</Text>}
        {tiles && <Text style={S.dimBadge}>{tiles}</Text>}
      </Box>
      {isIndoors && (
        <Box style={{ ...IL.layerRow, color: toggles ? 'var(--c-info)' : 'var(--c-secondary)' }}>
          {toggles
            ? <>▲▼ Layer Toggle {targetLayer && <Text style={IL.layerTarget}>{targetLayer}</Text>}</>
            : <>═ No Layer Change</>}
        </Box>
      )}
      {crossing.requirements.length > 0 && (
        <Box style={S.meta}>{crossing.requirements.map(req => <ReqIcon key={req} req={req} />)}</Box>
      )}
    </Box>
  );
};

export { EdgeCard };
