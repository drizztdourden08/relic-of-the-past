/* @layer renderer-lib @kind logic */
import { alttpMsuConfig, msu } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const readMsuManifest = (pack: string) => msu.readManifest(alttpMsuConfig, platformFiles(), pack);

export { readMsuManifest };
