/* @layer renderer-lib @kind logic */
import { msu } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const deleteMsuPack = (pack: string) => msu.deletePack(platformFiles(), pack);

export { deleteMsuPack };
