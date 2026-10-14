/* @layer renderer-lib @kind logic */
import type { FileStore } from '@drizztdourden08/brock-core';
import type { NamedSaveEntry } from '@drizztdourden08/brock-port-kit';
import type { ManifestFile, ManifestRecord } from '../save-files.type';
import { manifestRecords } from './manifest-records';

const portEntryOf = async (files: FileStore, { dir, kind }: ManifestFile, record: ManifestRecord): Promise<NamedSaveEntry[]> => {
  const { id, name, timestamp, trigger } = record;
  if (typeof id !== 'string' || typeof timestamp !== 'number') return [];
  const hasScreenshot = await files.exists(`${dir}/${id}.png`);
  if (kind === 'auto') {
    const autoTrigger = manifestRecords.triggerOf(trigger);
    return [{ id, name: autoTrigger, savedAt: timestamp, hasScreenshot, meta: { trigger: autoTrigger } }];
  }
  return typeof name === 'string' ? [{ id, name, savedAt: timestamp, hasScreenshot }] : [];
};

const portManifestText = async (files: FileStore, file: ManifestFile, text: string): Promise<string> => {
  const records = manifestRecords.parse(text);
  if (records === null) return text;
  const entries = await Promise.all(records.map((record) => portEntryOf(files, file, record)));
  return JSON.stringify(entries.flat());
};

export { portManifestText };
