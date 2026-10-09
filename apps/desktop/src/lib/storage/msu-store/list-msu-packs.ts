/* @layer renderer-lib @kind logic */
import * as msu from '@shared/storage/msu';
import { platformFiles } from '../platform-files';

const listMsuPacks = () => msu.listPacks(platformFiles());

export { listMsuPacks };
