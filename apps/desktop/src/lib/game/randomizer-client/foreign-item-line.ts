/* @layer bridge-wasm @kind logic */
import { primary } from '@shared/randomizer/receipt-text/highlight-markup/primary';
import { secondary } from '@shared/randomizer/receipt-text/highlight-markup/secondary';
import type { ReceiptLine } from '@rotp/game-core';
import { CHARACTER_CUTS, ELLIPSIS, UNKNOWN_OWNER } from './foreign-item-line.constants';
import type { ForeignItem } from './foreign-item-line.type';

const trimEnd = (text: string): string => text.replace(/[^A-Za-z0-9]+$/, '');

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
export type { ForeignItem, ForeignItemOf, ForeignOwners } from './foreign-item-line.type';
