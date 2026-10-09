/* @layer renderer-lib @kind logic */
import type { MsuPackMeta } from '@shared/types/msu-manifest';
import * as msu from '@shared/storage/msu';
import { platformFiles } from '../platform-files';

const createMsuPack = (pack: string, meta?: Partial<MsuPackMeta>) => msu.createPack(platformFiles(), pack, meta);

export { createMsuPack };
