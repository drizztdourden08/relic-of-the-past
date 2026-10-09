/* @layer renderer-lib @kind logic */
import { library } from '@rotp/packs';
import { platformFiles } from '../platform-files';

const deleteLinkSprite = (name: string): Promise<void> => library.deleteLinkSprite(platformFiles(), name);

export { deleteLinkSprite };
