/* @layer renderer-lib @kind logic */
import type { MsuPackManifest } from '@rotp/game-data';
import { alttpMsuConfig, msu } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const writeMsuManifest = (pack: string, manifest: MsuPackManifest) => msu.writeManifest(alttpMsuConfig, platformFiles(), pack, manifest);

export { writeMsuManifest };
