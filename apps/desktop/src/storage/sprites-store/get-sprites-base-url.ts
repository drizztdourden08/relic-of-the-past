/* @layer renderer-lib @kind logic */
import { spritesBaseUrl } from '@app/platform/sprites-base-url';

const getSpritesBaseUrl = (romFile: string): Promise<string> => spritesBaseUrl(romFile);

export { getSpritesBaseUrl };
