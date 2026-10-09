/* @layer shared-game @kind logic */
import type { PresenceGameState } from '../../presence/presence.type';

const owEventSet = (presenceState: PresenceGameState | undefined, screen: number, mask: number): boolean =>
  ((presenceState?.owEventInfo[screen] ?? 0) & mask) !== 0;

export { owEventSet };
