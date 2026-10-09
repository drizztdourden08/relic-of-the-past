/* @layer renderer-lib @kind logic */
import { platformFiles } from '../platform-files';

const canTrashMsuPack = (): boolean => platformFiles().trash !== undefined;

export { canTrashMsuPack };
