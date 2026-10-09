/* @layer shared-asset-extraction @kind types */
import type { ImageBuffer } from '../graphics/png-writer';

type BaseResolver = (file: string) => ImageBuffer | null;

export type { BaseResolver };
