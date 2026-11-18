/* @layer renderer-lib @kind logic */
import type { RomImport } from '@drizztdourden08/brock-port-kit';
import type { RomKindSpec } from '@rotp/roms';
import { textOf } from '@app/shell/text-bridge';

const refusalMessage = (refused: RomImport & { ok: false }, spec: RomKindSpec): string => {
  if (refused.message) return refused.message;
  const label = textOf(spec.label);
  if (refused.reason === 'unknown') {
    return `Not a recognised ${label} (SHA-1 ${refused.hash.slice(0, 16)}...). Only the supported revision can be used.`;
  }
  return `File is not a valid ${label} or archive`;
};

export { refusalMessage };
