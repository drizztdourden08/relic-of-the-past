/* @layer renderer-lib @kind logic */
import * as library from '@shared/storage/link-sprites/link-sprites';
import { platformFiles } from '../platform-files';

const writeLinkSprite = (name: string, bytes: Uint8Array): Promise<void> =>
  library.writeLinkSprite(platformFiles(), name, bytes);

export { writeLinkSprite };
