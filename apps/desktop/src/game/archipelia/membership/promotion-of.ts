/* @layer bridge-wasm @kind logic */
import type { LobbyStart } from '@rotp/randomizer';
import type { ProfileRandomizerConfig } from '@app/profiles/types';
import { roomUrlsOf } from './room-urls-of';

const promotionOf = (config: ProfileRandomizerConfig, start: LobbyStart, lobbyServer: string): ProfileRandomizerConfig => {
  const { password: _old, fallbackServerUrl: _oldFallback, ...rest } = config;
  const { room, slots } = start;
  return {
    ...rest,
    mode: 'online',
    origin: 'archipelia',
    ...roomUrlsOf(lobbyServer, room),
    slotName: slots[0]?.name ?? config.slotName,
    ...(room.password === undefined || room.password === '' ? {} : { password: room.password }),
  };
};

export { promotionOf };
