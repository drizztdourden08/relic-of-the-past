/* @layer renderer-lib @kind logic */
import { platformFiles } from '../platform-files';

const canTrashMsuPack = (): boolean => 'trash' in platformFiles();

export { canTrashMsuPack };
