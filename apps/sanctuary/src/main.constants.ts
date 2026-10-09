/* @layer renderer-app @kind constants */
import type { TesseraOverrides } from '@drizztdourden08/tessera/primitives';

const TESSERA_OVERRIDES: TesseraOverrides = {
  writeText: (text) => navigator.clipboard.writeText(text),
};

export { TESSERA_OVERRIDES };
