/* @layer bridge-wasm @kind logic */
import { SERVER_NAME, SERVER_SLOT } from './ap-names.constants';
import type { GameNames, NameTables, PlayerEntry } from './ap-names.type';

const invert = (table: Record<string, number>): Map<number, string> =>
  new Map(Object.entries(table).map(([name, id]) => [id, name]));

const createNameTables = (): NameTables => {
  const games = new Map<string, GameNames>();
  const players = new Map<number, PlayerEntry>();

  const namesOfSlot = (slot: number): GameNames | undefined => {
    const game = players.get(slot)?.game;
    return game === undefined ? undefined : games.get(game);
  };

  return {
    addGames(next) {
      for (const [game, data] of Object.entries(next)) {
        games.set(game, { items: invert(data.item_name_to_id), locations: invert(data.location_name_to_id) });
      }
    },
    setPlayers(list, team) {
      for (const player of list) {
        if (player.team !== team) continue;
        const previous = players.get(player.slot);
        players.set(player.slot, { name: player.name, alias: player.alias, game: previous?.game });
      }
    },
    setSlotInfo(slotInfo) {
      for (const [slotKey, info] of Object.entries(slotInfo)) {
        const slot = Number(slotKey);
        const previous = players.get(slot);
        players.set(slot, { name: previous?.name ?? info.name, alias: previous?.alias ?? info.name, game: info.game });
      }
    },
    playerName(slot) {
      if (slot === SERVER_SLOT) return SERVER_NAME;
      const entry = players.get(slot);
      return entry ? (entry.alias || entry.name) : `Player ${slot}`;
    },
    gameOf(slot) {
      return players.get(slot)?.game;
    },
    itemName(itemId, ownerSlot) {
      return namesOfSlot(ownerSlot)?.items.get(itemId) ?? `Item ${itemId}`;
    },
    locationName(locationId, finderSlot) {
      return namesOfSlot(finderSlot)?.locations.get(locationId) ?? `Location ${locationId}`;
    },
    itemNameInGame(game, itemId) {
      return games.get(game)?.items.get(itemId);
    },
  };
};

export { createNameTables };
export type { NameTables } from './ap-names.type';
