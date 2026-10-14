/* @layer renderer-lib @kind types */
import type { NamedSaveKind } from '@drizztdourden08/brock-port-kit';

type AutoTrigger = 'timer' | 'quit';

type ManifestFile = { dir: string; kind: NamedSaveKind };

type ManifestRecord = Record<string, unknown>;

type SavePayload = { data: Uint8Array; screenshot?: Uint8Array | undefined };

export type { AutoTrigger, ManifestFile, ManifestRecord, SavePayload };
