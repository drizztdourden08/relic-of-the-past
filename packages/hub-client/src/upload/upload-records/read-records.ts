/* @layer site-kit @kind logic */
import { withStore } from '../upload-db';
import { RECORDS } from '../upload-db.constants';
import type { UploadRecord } from '../upload-record.type';

const readRecords = async <T>(site: string): Promise<UploadRecord<T>[]> => {
  const all = await withStore(RECORDS, 'readonly', (store) => store.getAll()).catch(() => null);
  return ((all ?? []) as UploadRecord<T>[]).filter((record) => record.site === site);
};

export { readRecords };
