/* @layer hub-core @kind logic */
import { badRequest } from '../http/http-error';
import type { Storage } from './create-storage.type';

const verifyUpload = async (storage: Storage, key: string, declaredBytes: number, capBytes: number): Promise<number> => {
  const stored = await storage.headSize(key);
  if (stored === null) throw badRequest('The upload did not arrive.');
  if (stored !== declaredBytes || stored > capBytes) {
    await storage.remove(key);
    throw badRequest(`The upload is ${stored} bytes, not the ${declaredBytes} declared.`);
  }
  return stored;
};

export { verifyUpload };
