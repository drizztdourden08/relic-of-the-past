/* @layer renderer-components @kind component */
/**
 * The room's players on this team as a table: slot, name, game, whether connected, the
 * client status and checks done. Another player's checks show while a tracker link to their
 * slot is up.
 */
import { Box, Text } from '@ds/primitives';
import { NetworkSection } from './NetworkSection';
import { PlayerRow } from './PlayerRow';
import type { NetworkPlayer } from '@app/lib/game/randomizer-client';

interface PlayersSectionProps {
  players: readonly NetworkPlayer[];
}

const HEADINGS = ['#', 'player', 'game', 'online', 'status', 'checks'] as const;

const PlayersSection = ({ players }: PlayersSectionProps) => (
  <NetworkSection title={`Players (${players.length})`}>
    {players.length === 0 ? (
      <Text className="randomizer-page__hint">No players yet.</Text>
    ) : (
      <Box role="table" className="network-tab__players">
        <Box role="row" className="network-tab__player network-tab__player--head">
          {HEADINGS.map((heading) => (
            <Text key={heading} role="columnheader" className="network-tab__cell">{heading}</Text>
          ))}
        </Box>
        {players.map((player) => <PlayerRow key={player.slot} player={player} />)}
      </Box>
    )}
  </NetworkSection>
);

export { PlayersSection };
export type { PlayersSectionProps };
