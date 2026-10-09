/* @layer electron-main @kind logic */
import { join } from 'path';
import { pathToFileURL } from 'url';

const spriteRequestPath = (requestUrl: string): string =>
  decodeURIComponent(new URL(requestUrl).pathname.replace(/^\/+/, ''));

const spriteFilePathOf = (spritesRoot: string, requestUrl: string): string =>
  join(spritesRoot, spriteRequestPath(requestUrl));

const spriteFileUrlOf = (spritesRoot: string, requestUrl: string): string =>
  pathToFileURL(spriteFilePathOf(spritesRoot, requestUrl)).href;

export { spriteFileUrlOf };
