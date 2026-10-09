/* @layer renderer-lib @kind logic */
import * as msu from '@shared/storage/msu';
import { platformFiles } from '../platform-files';

const readMsuManifest = (pack: string) => msu.readManifest(platformFiles(), pack);

export { readMsuManifest };
