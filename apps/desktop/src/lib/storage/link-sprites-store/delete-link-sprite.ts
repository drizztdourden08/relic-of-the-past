/* @layer renderer-lib @kind logic */
import * as library from '@shared/storage/link-sprites/link-sprites';
import { platformFiles } from '../platform-files';

const deleteLinkSprite = (name: string): Promise<void> => library.deleteLinkSprite(platformFiles(), name);

export { deleteLinkSprite };
