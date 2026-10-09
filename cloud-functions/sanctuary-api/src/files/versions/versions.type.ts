/* @layer root-config @kind types */
import type { SanctuaryFile } from '../../../../../shared/sanctuary';

type VersionMirror = Pick<SanctuaryFile, 'name' | 'bytes' | 'sha256' | 'contentType'>;

export type { VersionMirror };
