/* @layer renderer-lib @kind logic */
import { compileAlttpAssetSet, loadGbaAlttpRomFromBuffer, loadRomFromBuffer } from '@rotp/asset-extraction/buffer';
import { compileBake, extractRomPack, romSetInput } from '@rotp/languages';
import type { AssetsResult, BakeInputs } from './asset-files.type';

const bakeAssetSet = async ({ romBytes, supplementRoms, languages }: BakeInputs, onWarn: (message: string) => void): Promise<AssetsResult> => {
  const snes = loadRomFromBuffer(Buffer.from(romBytes));
  const romLanguage = extractRomPack(snes);
  const baked = compileBake(languages, romSetInput(romLanguage), onWarn);
  const gbaBytes = supplementRoms['gba-alttp'];
  const gbaRom = gbaBytes ? loadGbaAlttpRomFromBuffer(Buffer.from(gbaBytes)) : undefined;
  const set = await compileAlttpAssetSet({ snes, gbaAlttp: gbaRom }, baked);

  return {
    base: new Uint8Array(set.base),
    sidecars: set.supplements.flatMap((s) => (s.ok ? [{ id: s.id, bytes: new Uint8Array(s.container) }] : [])),
    failures: set.supplements.flatMap((s) => (s.ok ? [] : [{ id: s.id, reason: s.reason }])),
    romLanguage,
  };
};

export { bakeAssetSet };
