/* @layer shared-game @kind logic */
import type { Rng } from '../../rng';
import type { ShopBottleContent } from '../shops/shop-price.type';

const bottleContentPicker = (contents: readonly ShopBottleContent[], rng: Rng) => {
  const usedByAmount = new Map<number, Set<ShopBottleContent>>();
  return (amount: number): ShopBottleContent => {
    const used = usedByAmount.get(amount) ?? new Set<ShopBottleContent>();
    usedByAmount.set(amount, used);
    const open = contents.filter((content) => !used.has(content));
    const from = open.length > 0 ? open : contents;
    const content = from.length === 1 ? from[0] : from[rng.int(from.length)];
    used.add(content);
    return content;
  };
};

export { bottleContentPicker };
