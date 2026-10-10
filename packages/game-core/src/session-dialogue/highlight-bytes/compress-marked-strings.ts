/* @layer bridge-wasm @kind logic */
import { compressStrings } from '@rotp/asset-extraction';
import { splitControls } from './split-controls';

const encodeControlled = (runs: readonly string[], controls: readonly number[][], code: string): Uint8Array => {
  const chunks = compressStrings([...runs], code);
  const bytes: number[] = [];
  chunks.forEach((chunk, index) => {
    bytes.push(...chunk);
    const control = controls[index];
    if (control) bytes.push(...control);
  });
  return new Uint8Array(bytes);
};

const compressPlain = (text: string, code: string): Uint8Array => {
  const [bytes] = compressStrings([text], code);
  if (bytes === undefined) throw new Error('compressStrings returned no bytes for one text');
  return bytes;
};

const compressMarkedStrings = (texts: readonly string[], code: string): Uint8Array[] =>
  texts.map((text) => {
    const { runs, controls } = splitControls(text, code);
    return controls.length === 0 ? compressPlain(text, code) : encodeControlled(runs, controls, code);
  });

export { compressMarkedStrings };
