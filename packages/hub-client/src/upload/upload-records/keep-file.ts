/* @layer site-kit @kind logic */
import { withStore } from '../upload-db';
import { FILES } from '../upload-db.constants';
import { KEEP_MARGIN } from './upload-records.constants';

const hasRoomFor = async (bytes: number): Promise<boolean> => {
  if (!navigator.storage?.estimate) return false;
  const { quota = 0, usage = 0 } = await navigator.storage.estimate();
  return quota - usage > bytes * KEEP_MARGIN;
};

const keepFile = async (id: string, file: Blob): Promise<boolean> => {
  try {
    if (!(await hasRoomFor(file.size))) return false;
    const saved = await withStore(FILES, 'readwrite', (store) => store.put(file, id));
    return saved !== null;
  } catch {
    return false;
  }
};

export { keepFile };
