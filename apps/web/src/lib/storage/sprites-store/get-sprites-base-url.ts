/* @layer renderer-lib @kind logic */
import { getPlatform } from '@app/platform/get-platform';

const getSpritesBaseUrl = (romFile: string): Promise<string> => getPlatform().storage.spritesBaseUrl(romFile);

export { getSpritesBaseUrl };
