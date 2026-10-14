/* @layer renderer-lib @kind logic */
import type { NamedSaveKind } from '@drizztdourden08/brock-port-kit';
import type { ManifestRecord } from '../save-files.type';
import { manifestRecords } from './manifest-records';

const rotpEntryOf = (kind: NamedSaveKind, { id, name, savedAt, meta }: ManifestRecord): ManifestRecord =>
  (kind === 'auto'
    ? { id, timestamp: savedAt, trigger: manifestRecords.metaTriggerOf(meta) }
    : { id, name, timestamp: savedAt });

const rotpManifestText = (kind: NamedSaveKind, text: string): string => {
  const records = manifestRecords.parse(text);
  return records === null ? text : JSON.stringify(records.map((record) => rotpEntryOf(kind, record)), null, 2);
};

export { rotpManifestText };
