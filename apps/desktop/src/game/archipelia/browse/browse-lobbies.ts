/* @layer bridge-wasm @kind logic */
import { lobbyBrowse } from '@rotp/randomizer';
import { createMainSocket } from '../socket/create-main-socket';
import type { BrowsedEntry } from './browsed-entry.type';

const entriesOf = async (server: string): Promise<BrowsedEntry[]> => {
  const result = await lobbyBrowse(server, { createSocket: createMainSocket });
  return result.ok ? result.lobbies.map((lobby) => ({ server, lobby })) : [];
};

const browseLobbies = async (servers: readonly string[]): Promise<BrowsedEntry[]> =>
  (await Promise.all(servers.map(entriesOf))).flat();

export { browseLobbies };
