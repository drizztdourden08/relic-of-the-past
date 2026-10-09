/* @layer renderer-lib @kind logic */
import * as msu from '@shared/storage/msu';
import { platformFiles } from '../platform-files';

const renameMsuPack = (from: string, to: string) => msu.renamePack(platformFiles(), from, to);

export { renameMsuPack };
