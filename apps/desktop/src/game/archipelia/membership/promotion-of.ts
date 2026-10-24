/* @layer bridge-wasm @kind logic */
import type { LobbyStart } from '@rotp/randomizer';
import type { ProfileRandomizerConfig } from '@app/profiles/types';

const serverUrlOf = ({ host, port, tls }: LobbyStart['room']): string => {
  if (tls === 'yes') return `wss://${host}:${port}`;
  return tls === 'no' ? `ws://${host}:${port}` : `${host}:${port}`;
};

const promotionOf = (config: ProfileRandomizerConfig, start: LobbyStart): ProfileRandomizerConfig => {
  const { password: _old, ...rest } = config;
  const { room, slots } = start;
  return {
    ...rest,
    mode: 'online',
    origin: 'archipelia',
    serverUrl: serverUrlOf(room),
    slotName: slots[0]?.name ?? config.slotName,
    ...(room.password === undefined || room.password === '' ? {} : { password: room.password }),
  };
};

export { promotionOf };
