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
 *
 * The pool icons (pool/*.svg) are a third case: free-colour `art-badge`
 * drawings that become PNGs for this app's own surfaces only, one per game a
 * multiworld pool may hold. The Archipelago badge stamped on them lives beside
 * them and is never a sprite of its own.
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
import poolALinkBetweenWorlds from './pool/a-link-between-worlds.svg?raw';
import poolArchipelago from './pool/archipelago.svg?raw';
import poolArchipelagoBadge from './pool/archipelago-badge.svg?raw';
import poolLinksAwakening from './pool/links-awakening.svg?raw';
import poolMajorasMask from './pool/majoras-mask.svg?raw';
import poolMinishCap from './pool/minish-cap.svg?raw';
import poolOcarinaOfTime from './pool/ocarina-of-time.svg?raw';
import poolOracleOfAges from './pool/oracle-of-ages.svg?raw';
import poolOracleOfSeasons from './pool/oracle-of-seasons.svg?raw';
import poolSkywardSword from './pool/skyward-sword.svg?raw';
import poolTwilightPrincess from './pool/twilight-princess.svg?raw';
import poolWindWaker from './pool/wind-waker.svg?raw';
import poolZelda1 from './pool/zelda-1.svg?raw';
import poolZelda2 from './pool/zelda-2.svg?raw';
import quiver from './quiver.svg?raw';
import wallet from './wallet.svg?raw';

const ART_LIBRARY: Readonly<Record<string, string>> = {
  'archipelago-badge': poolArchipelagoBadge,
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
  'pool-a-link-between-worlds': poolALinkBetweenWorlds,
  'pool-archipelago': poolArchipelago,
  'pool-links-awakening': poolLinksAwakening,
  'pool-majoras-mask': poolMajorasMask,
  'pool-minish-cap': poolMinishCap,
  'pool-ocarina-of-time': poolOcarinaOfTime,
  'pool-oracle-of-ages': poolOracleOfAges,
  'pool-oracle-of-seasons': poolOracleOfSeasons,
  'pool-skyward-sword': poolSkywardSword,
  'pool-twilight-princess': poolTwilightPrincess,
  'pool-wind-waker': poolWindWaker,
  'pool-zelda-1': poolZelda1,
  'pool-zelda-2': poolZelda2,
  quiver,
  wallet,
};

const artSvgOf = (name: string): string => {
  const svg = ART_LIBRARY[name];
  if (svg === undefined) throw new Error(`Unknown art: ${name}`);
  return svg;
};

export { ART_LIBRARY, artSvgOf };
