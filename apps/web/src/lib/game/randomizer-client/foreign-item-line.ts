/* @layer bridge-wasm @kind logic */
/**
 * The receipt line a location shows when its item belongs to another player: what it was and
 * who it went to, "Progressive Scale sent to Zelda!". One line per such location, composed with
 * the session's other lines, so the pickup says where the item went instead of showing a class
 * template.
 *
 * The line comes as candidates, fullest first (receipt-line.type.ts), and the composer keeps
 * the first that fits the box: the item name loses words from its end, then characters, and
 * says so with "...", before the line falls back to naming the player alone. The player is
 * never shortened. The item carries the primary highlight and a named player the secondary.
 */
import { primary, secondary } from '@shared/randomizer/receipt-text/highlight-markup';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { ReceiptLine } from '@shared/randomizer/receipt-text/receipt-line.type';

/** Another player's item at a location: whose it is, its name in their game, and that game. */
interface ForeignItem {
  owner: string;
  item?: string;
  game?: string;
}

/** location → the foreign item there; undefined when the room named nothing. */
type ForeignItemOf = (location: LocationKey) => ForeignItem | undefined;

/** location → the player its item belongs to, as an online session keeps it beside its placement. */
type ForeignOwners = Readonly<Partial<Record<LocationKey, string>>>;

const UNKNOWN_OWNER = 'another player';
const ELLIPSIS = '...';
/** The character cuts tried on an item name no word cut fits, longest first. */
const CHARACTER_CUTS = [16, 12, 8];

const trimEnd = (text: string): string => text.replace(/[^A-Za-z0-9]+$/, '');

/** Shorter forms of an item name, longest first, each ending in an ellipsis. */
const shortenedNames = (item: string): string[] => {
  const words = item.split(' ').filter((word) => word !== '');
  const byWord = words.slice(1).map((_, dropped) => words.slice(0, words.length - 1 - dropped).join(' '));
  const byCharacter = CHARACTER_CUTS.filter((cut) => cut < item.length).map((cut) => item.slice(0, cut));
  const unique = [...new Set([...byWord, ...byCharacter].map(trimEnd).filter((name) => name !== ''))];
  return unique.sort((a, b) => b.length - a.length).map((name) => `${name}${ELLIPSIS}`);
};

const foreignItemLine = (foreign: ForeignItem | undefined): ReceiptLine => {
  const owner = foreign?.owner === undefined ? UNKNOWN_OWNER : secondary(foreign.owner);
  const alone = `Sent to ${owner}!`;
  const item = foreign?.item?.trim();
  if (item === undefined || item === '') return alone;
  const names = [item, ...shortenedNames(item)];
  return [...names.map((name) => `${primary(name)} sent to ${owner}!`), alone];
};

export { foreignItemLine };
export type { ForeignItem, ForeignItemOf, ForeignOwners };
