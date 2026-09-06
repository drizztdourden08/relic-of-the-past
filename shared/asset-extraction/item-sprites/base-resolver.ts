/* @layer shared-asset-extraction @kind types */
/**
 * How a derived sprite reaches the picture it builds on: the caller resolves
 * another definition's file name to that definition's extracted picture, so a
 * composite or a recolour never knows how its base was decoded.
 */
import type { ImageBuffer } from '../graphics/png-writer';

type BaseResolver = (file: string) => ImageBuffer | null;

export type { BaseResolver };
