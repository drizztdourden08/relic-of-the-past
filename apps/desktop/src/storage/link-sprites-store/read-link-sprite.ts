/* @layer renderer-lib @kind logic */
import { library } from '@rotp/packs';
import { platformFiles } from '../platform-files';

const readLinkSprite = (name: string): Promise<Uint8Array | null> => library.readLinkSprite(platformFiles(), name);

export { readLinkSprite };
