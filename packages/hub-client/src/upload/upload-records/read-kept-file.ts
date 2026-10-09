/* @layer site-kit @kind logic */
import { withStore } from '../upload-db';
import { FILES } from '../upload-db.constants';

const readKeptFile = async (id: string): Promise<Blob | null> => {
  const file = await withStore<unknown>(FILES, 'readonly', (store) => store.get(id)).catch(() => null);
  return file instanceof Blob ? file : null;
};

export { readKeptFile };
