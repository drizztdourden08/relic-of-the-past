/* @layer renderer-components @kind component */
/**
 * The room's players on this team as a table: slot, name, game, whether connected, the
 * client status and checks done. Another player's checks show while a tracker link to their
 * slot is up.
 */
import { Text } from '@ds/primitives';
import { NetworkSection } from './NetworkSection';
import { PlayersTable } from './PlayersTable';
import { NOT_CONNECTED_HINT } from '../behavior/network-view';
import type { NetworkView } from '../behavior/network-view';
import type { PanelPlacement } from '../../../Randomizer.constants';

interface PlayersSectionProps {
  placement: PanelPlacement;
  view: NetworkView;
}

const PlayersSection = ({ placement, view }: PlayersSectionProps) => {
  const players = view.status?.players ?? null;
  return (
    <NetworkSection
      placement={placement}
      title={players === null ? 'Players' : `Players (${players.length})`}
      chip={view.live ? undefined : view.offline}
      rows={players === null ? null : []}
      empty={NOT_CONNECTED_HINT}
    >
      {players !== null && (players.length === 0
        ? <Text className="randomizer-page__hint">No players yet.</Text>
        : <PlayersTable players={players} />)}
    </NetworkSection>
  );
};

export { PlayersSection };
export type { PlayersSectionProps };
