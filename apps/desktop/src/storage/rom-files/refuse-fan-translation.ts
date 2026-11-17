/* @layer renderer-lib @kind logic */
import { sha1Hex } from '@drizztdourden08/brock-port-kit';
import type { RomImport, RomKindStore } from '@drizztdourden08/brock-port-kit';
import { fanTranslationRefusal, stripSmcHeader } from '@rotp/asset-extraction';

const refuseFanTranslation = async (store: RomKindStore, imported: RomImport & { ok: true }): Promise<string | null> => {
  if (!imported.rom.unknown) return null;
  const refusal = fanTranslationRefusal(await sha1Hex(stripSmcHeader(imported.rom.bytes)));
  if (refusal !== null && !imported.existed && imported.file) await store.remove(imported.file);
  return refusal;
};

export { refuseFanTranslation };
