/* @layer bridge-wasm @kind types */
import type { ApGameData, ApNetworkPlayer, ApNetworkSlot } from './ap-protocol.type';

interface GameNames {
  items: Map<number, string>;
  locations: Map<number, string>;
}

interface PlayerEntry {
  name: string;
  alias: string;
  game?: string;
}

interface NameTables {
  addGames(games: Record<string, ApGameData>): void;
  setPlayers(players: readonly ApNetworkPlayer[], team: number): void;
  setSlotInfo(slotInfo: Record<string, ApNetworkSlot>): void;
  playerName(slot: number): string;
  gameOf(slot: number): string | undefined;
  itemName(itemId: number, ownerSlot: number): string;
  locationName(locationId: number, finderSlot: number): string;
  itemNameInGame(game: string, itemId: number): string | undefined;
}

export type { GameNames, NameTables, PlayerEntry };
