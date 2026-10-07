/* @layer renderer-components @kind component */
/**
 * One player of the players table: slot, name, game, the online chip, the slot's client
 * status and checks done. This slot is marked "(you)". A compact row keeps name, game,
 * online and checks: the Run tab's short list.
 */
import { Box, Text } from '@ds/primitives';
import { ChecksCell } from './ChecksCell';
import { StateChip } from './StateChip';
import { DASH } from '../behavior/network-format';
import { onlineChip } from '../behavior/network-tone';
import type { NetworkPlayer } from '@app/lib/game/randomizer-client';

interface PlayerRowProps {
  player: NetworkPlayer;
  compact?: boolean;
}

const PlayerRow = ({ player, compact = false }: PlayerRowProps) => {
  const { slot, alias, game, online, status, self, checked, total } = player;
  const statusClass = status === 'unknown' ? ' network-tab__cell--dim' : '';
  return (
    <Box role="row" className={`network-tab__player${self ? ' network-tab__player--self' : ''}`}>
      {!compact && <Text role="cell" className="network-tab__cell network-tab__cell--num">{slot}</Text>}
      <Text role="cell" className="network-tab__cell">{self ? `${alias} (you)` : alias}</Text>
      <Text role="cell" className="network-tab__cell network-tab__cell--dim">{game ?? DASH}</Text>
      <Box role="cell" className="network-tab__cell"><StateChip {...onlineChip(online)} /></Box>
      {!compact && <Text role="cell" className={`network-tab__cell${statusClass}`}>{status}</Text>}
      <ChecksCell checked={checked} total={total} />
    </Box>
  );
};

export { PlayerRow };
export type { PlayerRowProps };
