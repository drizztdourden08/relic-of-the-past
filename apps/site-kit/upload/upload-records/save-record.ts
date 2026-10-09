/* @layer site-kit @kind logic */
import { withStore } from '../upload-db';
import { RECORDS } from '../upload-db.constants';
import type { UploadRecord } from '../upload-record.type';

const saveRecord = async <T>(record: UploadRecord<T>): Promise<void> => {
  await withStore(RECORDS, 'readwrite', (store) => store.put(record)).catch(() => null);
};

export { saveRecord };
