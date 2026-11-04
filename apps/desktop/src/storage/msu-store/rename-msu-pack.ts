/* @layer renderer-lib @kind logic */
import { alttpMsuConfig, msu } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const renameMsuPack = (from: string, to: string) => msu.renamePack(alttpMsuConfig, platformFiles(), from, to);

export { renameMsuPack };
