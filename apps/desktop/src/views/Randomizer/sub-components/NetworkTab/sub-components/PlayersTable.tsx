/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { PlayerRow } from './PlayerRow';
import { HEADINGS } from './PlayersTable.constants';
import type { PlayersTableProps } from './PlayersTable.type';

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
