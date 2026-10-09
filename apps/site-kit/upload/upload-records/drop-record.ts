/* @layer site-kit @kind logic */
import { withStore } from '../upload-db';
import { FILES, RECORDS } from '../upload-db.constants';

const dropRecord = async (id: string): Promise<void> => {
  await Promise.all([
    withStore(RECORDS, 'readwrite', (store) => store.delete(id)).catch(() => null),
    withStore(FILES, 'readwrite', (store) => store.delete(id)).catch(() => null),
  ]);
};

export { dropRecord };
