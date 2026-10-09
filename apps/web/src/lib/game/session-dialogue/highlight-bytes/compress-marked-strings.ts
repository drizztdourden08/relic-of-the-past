/* @layer bridge-wasm @kind logic */
import { compressStrings } from '@shared/asset-extraction/text/dialogue-encoder';
import { splitControls } from './split-controls';

const encodeControlled = (runs: readonly string[], controls: readonly number[][], code: string): Uint8Array => {
  const chunks = compressStrings([...runs], code);
  const bytes: number[] = [];
  chunks.forEach((chunk, index) => {
    bytes.push(...chunk);
    if (index < controls.length) bytes.push(...controls[index]);
  });
  return new Uint8Array(bytes);
};

const compressMarkedStrings = (texts: readonly string[], code: string): Uint8Array[] =>
  texts.map((text) => {
    const { runs, controls } = splitControls(text, code);
    return controls.length === 0 ? compressStrings([text], code)[0] : encodeControlled(runs, controls, code);
  });

export { compressMarkedStrings };
