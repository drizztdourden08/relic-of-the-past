/* @layer renderer-lib @kind logic */
import type { LobbyConnect, LobbyDraft } from './lobby-draft.type';

const connectModeOf = ({ location, connect }: Pick<LobbyDraft, 'location' | 'connect'>): LobbyConnect =>
  (location === 'remote' ? 'manual' : connect);

export { connectModeOf };
