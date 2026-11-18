/* @layer renderer-lib @kind logic */
import { sha1Hex } from '@drizztdourden08/brock-port-kit';
import type { RomImport, RomKindStore } from '@drizztdourden08/brock-port-kit';
import { stripSmcHeader } from '@rotp/asset-extraction';
import { fanTranslationMessage } from '@rotp/roms';
import { textOf } from '@app/shell/text-bridge';

const refuseFanTranslation = async (store: RomKindStore, imported: RomImport & { ok: true }): Promise<string | null> => {
  if (!imported.rom.unknown) return null;
  const refusal = fanTranslationMessage(await sha1Hex(stripSmcHeader(imported.rom.bytes)));
  if (refusal !== null && !imported.existed && imported.file) await store.remove(imported.file);
  return refusal === null ? null : textOf(refusal);
};

export { refuseFanTranslation };
