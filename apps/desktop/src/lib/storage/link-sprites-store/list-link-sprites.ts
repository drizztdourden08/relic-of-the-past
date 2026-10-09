/* @layer renderer-lib @kind logic */
import { library } from '@rotp/packs';
import { platformFiles } from '../platform-files';

const listLinkSprites = (): Promise<string[]> => library.listLinkSprites(platformFiles());

export { listLinkSprites };
