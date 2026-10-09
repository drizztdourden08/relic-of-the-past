/* @layer renderer-lib @kind logic */
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import * as msu from '@shared/storage/msu';
import { platformFiles } from '../platform-files';

const writeMsuManifest = (pack: string, manifest: MsuPackManifest) => msu.writeManifest(platformFiles(), pack, manifest);

export { writeMsuManifest };
