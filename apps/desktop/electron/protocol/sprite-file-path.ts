/* @layer electron-main @kind logic */
/**
 * Resolves an `app-sprite://sprites/<romStem>/<file>.png` request to the PNG the
 * extractor wrote under the data root's `sprites/` folder. The scheme is
 * registered as standard, so Chromium hands the path over percent-encoded
 * (spaces, commas and parentheses in a ROM stem included) with dot segments
 * already collapsed; it is decoded here and re-encoded as a proper file URL, so
 * a stem holding `#` or `%` still resolves. Pure: the handler supplies the
 * root, so a test can too.
 */
import { join } from 'path';
import { pathToFileURL } from 'url';

/** The request path relative to the sprites folder: `<romStem>/<file>.png`. */
const spriteRequestPath = (requestUrl: string): string =>
  decodeURIComponent(new URL(requestUrl).pathname.replace(/^\/+/, ''));

/** Absolute path of the requested PNG under `spritesRoot`. */
const spriteFilePathOf = (spritesRoot: string, requestUrl: string): string =>
  join(spritesRoot, spriteRequestPath(requestUrl));

/** The same file as a `file:` URL for net.fetch. */
const spriteFileUrlOf = (spritesRoot: string, requestUrl: string): string =>
  pathToFileURL(spriteFilePathOf(spritesRoot, requestUrl)).href;

export { spriteFilePathOf, spriteFileUrlOf };
