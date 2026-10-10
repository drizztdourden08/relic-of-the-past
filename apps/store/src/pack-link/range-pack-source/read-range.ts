/* @layer store-site @kind logic */
import { PARTIAL_CONTENT, WHOLE_FILE } from './range-pack-source.constants';
import { RangeReadError } from './range-read-error';

const readRange = async (url: string, start: number, length: number): Promise<Uint8Array> => {
  let res: Response;
  try {
    res = await fetch(url, { headers: { Range: `bytes=${start}-${start + length - 1}` } });
  } catch {
    throw new RangeReadError(null);
  }
  if (res.status === PARTIAL_CONTENT) return new Uint8Array(await res.arrayBuffer());
  if (res.status === WHOLE_FILE) return new Uint8Array(await res.arrayBuffer()).slice(start, start + length);
  throw new RangeReadError(res.status);
};

export { readRange };
