/* @layer renderer-lib @kind logic */
import { library } from '@rotp/packs';
import { platformFiles } from '../platform-files';

const writeLinkSprite = (name: string, bytes: Uint8Array): Promise<void> =>
  library.writeLinkSprite(platformFiles(), name, bytes);

export { writeLinkSprite };
