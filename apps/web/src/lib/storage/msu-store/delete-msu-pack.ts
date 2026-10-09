/* @layer renderer-lib @kind logic */
import * as msu from '@shared/storage/msu';
import { platformFiles } from '../platform-files';

const deleteMsuPack = (pack: string) => msu.deletePack(platformFiles(), pack);

export { deleteMsuPack };
