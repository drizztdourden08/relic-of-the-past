/* @layer shared-asset-extraction @kind data */
/**
 * Our own pixel-art drawings, by name. The SVG text is inlined at bundle time
 * (`?raw`), so the same table serves Electron main, the renderer and the
 * extraction Worker with no file access at runtime.
 *
 * How much colour a drawing may use depends on where it is used, and the two
 * uses differ. A drawing that IS the sprite (the `art` method) only ever
 * becomes a PNG for this app's own surfaces, written as 8 bit truecolour with
 * alpha, so it may carry any colours at all and is reproduced exactly. A
 * drawing consumed by `upgrade-composite`, as the base or as the badge stamped
 * on it, also reaches a binary the core draws with one fixed sprite palette
 * row, where every opaque pixel snaps to the nearest of that row's colours
 * (capacity-icons.ts): those drawings are kept inside the row on purpose.
 * The shop price symbols (currency-*.svg) are `art` sprites that ALSO reach
 * such a binary (currency-symbols.ts), so they are drawn in that row too.
 * The definition schema lists a separate set of names per method, so a
 * free-colour drawing cannot reach the quantized path by accident.
 */
import arrowUp from './arrow-up.svg?raw';
import currencyArrow from './currency-arrow.svg?raw';
import currencyBee from './currency-bee.svg?raw';
import currencyBluePotion from './currency-blue-potion.svg?raw';
import currencyBomb from './currency-bomb.svg?raw';
import currencyFairy from './currency-fairy.svg?raw';
import currencyGreenPotion from './currency-green-potion.svg?raw';
import currencyHeart from './currency-heart.svg?raw';
import currencyRedPotion from './currency-red-potion.svg?raw';
import currencyRupee from './currency-rupee.svg?raw';
import quiver from './quiver.svg?raw';
import wallet from './wallet.svg?raw';

const ART_LIBRARY: Readonly<Record<string, string>> = {
  'arrow-up': arrowUp,
  'currency-arrow': currencyArrow,
  'currency-bee': currencyBee,
  'currency-blue-potion': currencyBluePotion,
  'currency-bomb': currencyBomb,
  'currency-fairy': currencyFairy,
  'currency-green-potion': currencyGreenPotion,
  'currency-heart': currencyHeart,
  'currency-red-potion': currencyRedPotion,
  'currency-rupee': currencyRupee,
  quiver,
  wallet,
};

const artSvgOf = (name: string): string => {
  const svg = ART_LIBRARY[name];
  if (svg === undefined) throw new Error(`Unknown art: ${name}`);
  return svg;
};

export { ART_LIBRARY, artSvgOf };
