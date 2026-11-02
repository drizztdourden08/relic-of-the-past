/* @layer shared-types @kind types */
import type { OptimizeProgress } from '@rotp/msu';
import type { LanSighting } from '@rotp/randomizer';
import type { LobbySocketEvent } from './lobby-socket-contract.type';

interface EventContract {
  'msu:optimize:progress': (progress: OptimizeProgress) => void;
  'lan:sighting': (sighting: LanSighting) => void;
  'lobby-socket:event': (event: LobbySocketEvent) => void;
}

export type { EventContract };
