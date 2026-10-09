/* @layer renderer-lib @kind logic */
import { msu } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const readMsuManifest = (pack: string) => msu.readManifest(platformFiles(), pack);

export { readMsuManifest };
