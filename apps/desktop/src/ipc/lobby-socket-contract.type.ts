/* @layer shared-types @kind types */

type LobbySocketEvent =
  | { id: string; kind: 'open' }
  | { id: string; kind: 'message'; text: string }
  | { id: string; kind: 'error' }
  | { id: string; kind: 'close'; code: number };

interface LobbySocketInvokeContract {
  'lobby-socket:open': (id: string, url: string) => Promise<void>;
  'lobby-socket:send': (id: string, data: string) => Promise<void>;
  'lobby-socket:close': (id: string) => Promise<void>;
}

export type { LobbySocketEvent, LobbySocketInvokeContract };
