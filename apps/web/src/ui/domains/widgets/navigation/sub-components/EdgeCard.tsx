/* @layer renderer-widgets @kind component */
import type { CSSProperties } from 'react';
import type { ScreenBundle, ScreenCrossing } from '@shared/game/navigation';
import { Box, Text } from '../../../../design-system/primitives';
import { S } from '../styles';
import { ReqIcon } from './ReqIcon';
import { EdgeArrowSvg } from './EdgeArrowSvg';
import type { EdgeRow } from '../nav-flood/use-nav-connections';

const IL: Record<string, CSSProperties> = {
  blocked: { opacity: 0.55, borderColor: 'var(--c-warning)' },
  blockedTag: { fontSize: 9, color: 'var(--c-warning)' },
  layerRow: { fontSize: 9, marginTop: 2 },
  layerTarget: { color: 'var(--c-info)' },
};

interface Props {
  row: EdgeRow;
  screenBundle: ScreenBundle | null;
  isIndoors: boolean;
  /** The floor the player stands on, which a toggling border flips. */
  playerLayer: number | null | undefined;
}

/** The tiles the scroll runs across, on the axis its side runs along. */
const spanOf = (crossing: ScreenCrossing): string => {
  if (!crossing.span) return '';
  const axis = crossing.side === 'north' || crossing.side === 'south' ? 'c' : 'r';
  return `${axis}${crossing.span.from}-${crossing.span.to}`;
};

/** Walkable tiles of the run, and the gated ones behind a plus. */
const tilesOf = (span: ScreenCrossing['span']): string =>
  span === undefined ? '' : `${span.freeTiles}${span.itemTiles > 0 ? `+${span.itemTiles}` : ''}`;

/** One boundary scroll off the flooded area. */
const EdgeCard = ({ row, screenBundle, isIndoors, playerLayer }: Props) => {
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
        <Box style={{ ...IL.layerRow, color: toggles ? 'var(--c-info)' : 'var(--c-green)' }}>
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
