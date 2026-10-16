/* @layer renderer-lib @kind logic */
import { compileAlttpAssetSet, loadGbaAlttpRomFromBuffer, loadRomFromBuffer } from '@rotp/asset-extraction/buffer';
import { compileSets } from '@rotp/languages';
import type { AssetsResult, BakeInputs } from './asset-files.type';

const bakeAssetSet = async ({ romBytes, supplementRoms, languages }: BakeInputs, onWarn: (message: string) => void): Promise<AssetsResult> => {
  const extraLanguages = compileSets(languages, onWarn);
  const gbaBytes = supplementRoms['gba-alttp'];
  const gbaRom = gbaBytes ? loadGbaAlttpRomFromBuffer(Buffer.from(gbaBytes)) : undefined;
  const set = await compileAlttpAssetSet({
    snes: loadRomFromBuffer(Buffer.from(romBytes)),
    gbaAlttp: gbaRom,
  }, { extraLanguages });

  return {
    base: new Uint8Array(set.base),
    sidecars: set.supplements.flatMap((s) => (s.ok ? [{ id: s.id, bytes: new Uint8Array(s.container) }] : [])),
    failures: set.supplements.flatMap((s) => (s.ok ? [] : [{ id: s.id, reason: s.reason }])),
  };
};

export { bakeAssetSet };
