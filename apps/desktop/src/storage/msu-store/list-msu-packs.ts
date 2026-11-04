/* @layer renderer-lib @kind logic */
import { alttpMsuConfig, msu } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const listMsuPacks = () => msu.listPacks(alttpMsuConfig, platformFiles());

export { listMsuPacks };
