/* @layer renderer-components @kind component */
/** The room's rules: release, collect and remaining, hints, its games and the data package check. */
import { NetworkSection } from './NetworkSection';
import { DASH, formatValue, formatYesNo } from '../behavior/network-format';
import { NOT_CONNECTED_HINT } from '../behavior/network-view';
import type { NetworkServer } from '@app/lib/game/randomizer-client';
import type { NetworkRow } from './NetworkSection';
import type { NetworkView } from '../behavior/network-view';
import type { PanelPlacement } from '../../../Randomizer.constants';

interface ServerSectionProps {
  placement: PanelPlacement;
  view: NetworkView;
}

const hintCostText = (server: NetworkServer): string => {
  const { hintCostPoints, hintCostPercent } = server;
  if (hintCostPercent === null) return DASH;
  return hintCostPoints === null ? `${hintCostPercent}%` : `${hintCostPoints} pts (${hintCostPercent}%)`;
};

const checksumText = (server: NetworkServer): string => {
  const { checksums } = server;
  if (checksums.length === 0) return DASH;
  const stale = checksums.filter((entry) => !entry.matched).map((entry) => entry.game);
  const matched = `${checksums.length - stale.length} / ${checksums.length} matched`;
  return stale.length === 0 ? matched : `${matched}, differs: ${stale.join(', ')}`;
};

const serverRows = (server: NetworkServer): NetworkRow[] => [
  { label: 'release', value: server.permissions?.release ?? DASH },
  { label: 'collect', value: server.permissions?.collect ?? DASH },
  { label: 'remaining', value: server.permissions?.remaining ?? DASH },
  { label: 'hint cost', value: hintCostText(server) },
  { label: 'hint points', value: formatValue(server.hintPoints) },
  { label: 'points per check', value: formatValue(server.locationCheckPoints) },
  { label: 'password', value: formatYesNo(server.passwordRequired) },
  { label: 'games', value: server.games.length > 0 ? server.games.join(', ') : DASH },
  { label: 'data package', value: checksumText(server) },
];

const ServerSection = ({ placement, view }: ServerSectionProps) => (
  <NetworkSection
    placement={placement}
    title="Server"
    chip={view.live ? undefined : view.offline}
    rows={view.status === null ? null : serverRows(view.status.server)}
    empty={NOT_CONNECTED_HINT}
  />
);

export { ServerSection };
export type { ServerSectionProps };
