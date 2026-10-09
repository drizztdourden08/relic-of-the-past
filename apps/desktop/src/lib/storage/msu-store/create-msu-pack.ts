/* @layer renderer-lib @kind logic */
import type { MsuPackMeta } from '@rotp/game-data';
import { msu } from '@rotp/msu';
import { platformFiles } from '../platform-files';

const createMsuPack = (pack: string, meta?: Partial<MsuPackMeta>) => msu.createPack(platformFiles(), pack, meta);

export { createMsuPack };
