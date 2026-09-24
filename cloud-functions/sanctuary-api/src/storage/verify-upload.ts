/* @layer root-config @kind logic */
/** After a client says an upload is done, HEAD the object and hold it to the
 *  size it declared and the cap for its kind. A mismatch removes the object so
 *  a record never points at bytes it did not describe. */
import { badRequest } from '../http/http-error';
import { b2 } from './b2';

const verifyUpload = async (key: string, declaredBytes: number, capBytes: number): Promise<number> => {
  const stored = await b2.headSize(key);
  if (stored === null) throw badRequest('The upload did not arrive.');
  if (stored !== declaredBytes || stored > capBytes) {
    await b2.remove(key);
    throw badRequest(`The upload is ${stored} bytes, not the ${declaredBytes} declared.`);
  }
  return stored;
};

export { verifyUpload };
