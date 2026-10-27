/* @layer website-site @kind types */
import type { ImageStatus } from '../Image.type';

type SettledImage = { source: string; status: ImageStatus; ratio?: string };

export type { SettledImage };
