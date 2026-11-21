/* @layer bridge-wasm @kind logic */
import { RomLoadError } from '@rotp/asset-extraction';
import { ROM_ERROR_PREFIX } from './rom-error-wire.constants';

const toWireError = (err: unknown): unknown =>
  (err instanceof RomLoadError ? new Error(`${ROM_ERROR_PREFIX}${JSON.stringify(err.text)}`) : err);

export { toWireError };
