/* @layer renderer-other @kind logic */
import type { EditRefusal } from './api-shim.type';

const refuseEdit = async (): Promise<EditRefusal> =>
  ({ success: false, error: 'The dataset editor needs the desktop app.' });

export { refuseEdit };
