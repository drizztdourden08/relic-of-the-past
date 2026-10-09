/* @layer renderer-lib @kind logic */
import * as library from '@shared/storage/link-sprites/link-sprites';
import { platformFiles } from '../platform-files';

const listLinkSprites = (): Promise<string[]> => library.listLinkSprites(platformFiles());

export { listLinkSprites };
