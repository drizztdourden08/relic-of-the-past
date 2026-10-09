/* @layer renderer-lib @kind logic */
import * as library from '@shared/storage/link-sprites/link-sprites';
import { platformFiles } from '../platform-files';

const readLinkSprite = (name: string): Promise<Uint8Array | null> => library.readLinkSprite(platformFiles(), name);

export { readLinkSprite };
