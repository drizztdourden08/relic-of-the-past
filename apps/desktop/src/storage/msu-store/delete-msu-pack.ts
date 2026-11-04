/* @layer renderer-lib @kind logic */
import { alttpMsuConfig, msu } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const deleteMsuPack = (pack: string) => msu.deletePack(alttpMsuConfig, platformFiles(), pack);

export { deleteMsuPack };
