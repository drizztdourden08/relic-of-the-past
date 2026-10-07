/* @layer renderer-components @kind component */
/**
 * The room's players as one table: a row each, the cells joining the table's columns. The
 * full table heads its columns; a compact one (the Run tab's) drops the slot and status
 * columns and the heading row with them.
 */
import { Box, Text } from '@ds/primitives';
import { PlayerRow } from './PlayerRow';
import type { NetworkPlayer } from '@app/lib/game/randomizer-client';

interface PlayersTableProps {
  players: readonly NetworkPlayer[];
  compact?: boolean;
}

const HEADINGS = ['#', 'player', 'game', 'online', 'status', 'checks'] as const;

const PlayersTable = ({ players, compact = false }: PlayersTableProps) => (
  <Box role="table" className="network-tab__players" data-compact={compact ? '' : undefined}>
    {!compact && (
      <Box role="row" className="network-tab__player network-tab__player--head">
        {HEADINGS.map((heading) => (
          <Text key={heading} role="columnheader" className="network-tab__cell">{heading}</Text>
        ))}
      </Box>
    )}
    {players.map((player) => <PlayerRow key={player.slot} player={player} compact={compact} />)}
  </Box>
);

export { PlayersTable };
export type { PlayersTableProps };
