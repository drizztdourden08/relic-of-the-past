/* @layer shared-game @kind data */
/**
 * Which pool icon stands for a game, by the name Archipelago gives it.
 *
 * Lookup is on the name with case and punctuation dropped, so a world spelled
 * "Links Awakening DX" and one spelled "Link's Awakening DX" land on the same
 * picture without the table guessing at anything. Several spellings may point
 * at one icon; nothing is matched loosely.
 *
 * A name we hold no drawing for falls back to the Archipelago mark, which is
 * what the mark is for. That covers every non-Zelda game in a pool, and it
 * covers a Zelda world whose name we spelled wrong here, so a mistake in this
 * table costs a generic icon and never a broken one. The room names its own
 * games in `RoomInfo.games`, so a live session is the way to correct it.
 */

const POOL_ICON_FALLBACK = 'pool-archipelago';

/** Case and punctuation dropped, so only the letters and digits are compared. */
const normalizeGameName = (game: string): string => game.toLowerCase().replace(/[^a-z0-9]/g, '');

const POOL_ICON_BY_GAME: Readonly<Record<string, string>> = {
  thelegendofzelda: 'pool-zelda-1',
  zeldaiitheadventureoflink: 'pool-zelda-2',
  theadventureoflink: 'pool-zelda-2',
  linksawakeningdx: 'pool-links-awakening',
  linksawakening: 'pool-links-awakening',
  ocarinaoftime: 'pool-ocarina-of-time',
  thelegendofzeldaocarinaoftime: 'pool-ocarina-of-time',
  majorasmask: 'pool-majoras-mask',
  majorasmaskrecompiled: 'pool-majoras-mask',
  oracleofages: 'pool-oracle-of-ages',
  oracleofseasons: 'pool-oracle-of-seasons',
  theminishcap: 'pool-minish-cap',
  minishcap: 'pool-minish-cap',
  thewindwaker: 'pool-wind-waker',
  windwaker: 'pool-wind-waker',
  twilightprincess: 'pool-twilight-princess',
  skywardsword: 'pool-skyward-sword',
  skywardswordhd: 'pool-skyward-sword',
  alinkbetweenworlds: 'pool-a-link-between-worlds',
};

/** The extracted file name of a game's pool icon, Archipelago's mark if we hold none. */
const poolIconFileOf = (game: string): string =>
  POOL_ICON_BY_GAME[normalizeGameName(game)] ?? POOL_ICON_FALLBACK;

export { POOL_ICON_FALLBACK, poolIconFileOf };
