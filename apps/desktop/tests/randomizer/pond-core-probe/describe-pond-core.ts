/* @layer tests @kind helper */
import { existsSync } from 'node:fs';
import { describe } from 'vitest';
import { assetBlobPath } from '../../story-events/core-harness/asset-blob-path';
import { FIXTURE, WASM_JS } from './pond-core.constants';

const describePondCore = existsSync(WASM_JS) && existsSync(FIXTURE) && assetBlobPath() !== undefined
  ? describe
  : describe.skip;

export { describePondCore };
