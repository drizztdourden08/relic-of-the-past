/* @layer renderer-lib @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { RomImport } from '@drizztdourden08/brock-port-kit';
import type { RomKindSpec } from '@rotp/roms';
import { textOf } from '@app/shell/text-bridge';

const refusalMessage = (refused: RomImport & { ok: false }, spec: RomKindSpec): string => {
  if (refused.message) return refused.message;
  const label = textOf(spec.label);
  if (refused.reason === 'unknown') return textOf(msg('roms:refusal.unknown', { label, hash: `${refused.hash.slice(0, 16)}...` }));
  return textOf(msg('roms:refusal.invalid', { label }));
};

export { refusalMessage };
