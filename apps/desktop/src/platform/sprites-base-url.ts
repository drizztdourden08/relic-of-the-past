/* @layer renderer-other @kind logic */
import { getPlatform } from '@drizztdourden08/brock-react';

const spritesBaseUrl = async (romFile: string): Promise<string> => (await getPlatform().sprites?.baseUrl(romFile)) ?? '';

export { spritesBaseUrl };
