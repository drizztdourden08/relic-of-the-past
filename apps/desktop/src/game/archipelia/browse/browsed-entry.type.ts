/* @layer bridge-wasm @kind types */
import type { BrowsedLobby } from '@rotp/randomizer';

interface BrowsedEntry {
  server: string;
  lobby: BrowsedLobby;
}

export type { BrowsedEntry };
