/* @layer bridge-wasm @kind logic */
import type { FontReference, RomData, RomLanguage } from '@rotp/asset-extraction';
import { fontReferenceOfRom, loadRomFromBuffer } from '@rotp/asset-extraction/buffer';

interface LibraryReferences {
  baseRom: RomData | null;
  references: FontReference[];
}

const loadQuietly = (bytes: Uint8Array): RomData | null => {
  try {
    return loadRomFromBuffer(Buffer.from(bytes), true);
  } catch {
    return null;
  }
};

const libraryReferences = (libraryRoms: readonly Uint8Array[], base: RomLanguage): LibraryReferences => {
  const roms = libraryRoms.map(loadQuietly).filter((rom): rom is RomData => rom !== null);
  const references = roms
    .map((rom) => fontReferenceOfRom(rom, base))
    .filter((reference): reference is FontReference => reference !== null);
  return { baseRom: roms.find((rom) => rom.language === base) ?? null, references };
};

export { libraryReferences };
