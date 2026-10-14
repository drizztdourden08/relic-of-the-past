/* @layer renderer-lib @kind logic */
import type { AutoTrigger, ManifestRecord } from '../save-files.type';

const isRecord = (value: unknown): value is ManifestRecord => typeof value === 'object' && value !== null;

const parse = (text: string): ManifestRecord[] | null => {
  try {
    const value: unknown = JSON.parse(text);
    return Array.isArray(value) ? value.filter(isRecord) : null;
  } catch {
    return null;
  }
};

const triggerOf = (value: unknown): AutoTrigger => (value === 'quit' ? 'quit' : 'timer');

const metaTriggerOf = (meta: unknown): AutoTrigger => triggerOf(isRecord(meta) ? meta.trigger : undefined);

const manifestRecords = { isRecord, parse, triggerOf, metaTriggerOf };

export { manifestRecords };
