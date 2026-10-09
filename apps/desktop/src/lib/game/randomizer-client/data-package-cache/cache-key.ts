/* @layer bridge-wasm @kind logic */
import { KEY_PREFIX } from './data-package-cache.constants';

const cacheKey = (game: string, checksum: string): string => `${KEY_PREFIX}${game}.${checksum}`;

export { cacheKey };
