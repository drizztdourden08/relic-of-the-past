/* @layer root-config @kind types */
import type { SanctuaryFile } from '@rotp/hub-contracts';

type VersionMirror = Pick<SanctuaryFile, 'name' | 'bytes' | 'sha256' | 'contentType'>;

export type { VersionMirror };
