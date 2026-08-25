/* @layer shared-storage @kind logic */
/**
 * Asset blob (.dat) storage over FileStore + the inputs the extraction Worker needs.
 * The compile itself runs in a renderer Worker (Node-Buffer pipeline); this module
 * only does the FileStore I/O (read ROMs + language sets, write the containers).
 *
 * The base blob and each optional supplement are stored as SEPARATE files and joined
 * into one buffer only when loading. That separation is the point: the engine wants a
 * single buffer with the supplement concatenated on the end, but if we also *stored* it
 * that way then any base-only rebuild would silently delete the supplement. Different
 * lifetimes, different filenames, so a rebuild physically cannot erase the other half.
 */
import { SUPPLEMENT_IDS } from '@shared/asset-extraction/sources/source-ids';
import type { AssetSourceId } from '@shared/asset-extraction/sources/source-ids';
import type { FileStore } from '@shared/platform';
import type { SetBakeInput } from '@shared/game/language';
import { getSet, getSetFont, list as listSets } from './languages';
import { ROM_KINDS } from './rom-kinds';

const datName = (romFile: string): string => romFile.replace(/\.(sfc|smc)$/i, '.dat');
const sidecarName = (romFile: string, id: AssetSourceId): string =>
  `${datName(romFile).replace(/\.dat$/, '')}.${id}.dat`;

const basePath = (romFile: string): string => `assets/${datName(romFile)}`;
const sidecarPath = (romFile: string, id: AssetSourceId): string => `assets/${sidecarName(romFile, id)}`;

/** The supplement ROM the user has imported for a source id, if any. */
const supplementRomFile = async (files: FileStore, id: AssetSourceId): Promise<string | null> => {
  const spec = Object.values(ROM_KINDS).find((candidate) => candidate.sourceId === id);
  if (!spec) return null;
  const found = (await files.list('roms')).find((file) => spec.pattern.test(file));
  return found ?? null;
};

/**
 * True when the cached blob is complete for what the user currently owns.
 *
 * A missing base means "extract". So does a supplement ROM that has no sidecar yet, which
 * is what makes importing the second cartridge after the fact rebuild automatically
 * instead of leaving a stale base-only blob in place forever.
 */
const check = async (files: FileStore, romFile: string): Promise<boolean> => {
  const stat = await files.stat(basePath(romFile));
  if (!stat || stat.bytes <= 0) return false;

  for (const id of SUPPLEMENT_IDS) {
    if (!(await supplementRomFile(files, id))) continue;
    const sidecar = await files.stat(sidecarPath(romFile, id));
    if (!sidecar || sidecar.bytes <= 0) return false;
  }
  return true;
};

const concatBytes = (parts: Uint8Array[]): Uint8Array => {
  const total = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.byteLength;
  }
  return out;
};

/** Base plus every present sidecar, in append order — the single buffer the core expects. */
const load = async (files: FileStore, romFile: string): Promise<Uint8Array | null> => {
  const base = await files.readBytes(basePath(romFile));
  if (!base) return null;

  const parts = [base];
  for (const id of SUPPLEMENT_IDS) {
    const extra = await files.readBytes(sidecarPath(romFile, id));
    if (extra && extra.byteLength > 0) parts.push(extra);
  }
  return parts.length === 1 ? base : concatBytes(parts);
};

const writeDat = (files: FileStore, romFile: string, dat: Uint8Array): Promise<void> =>
  files.writeBytes(basePath(romFile), dat);

const writeSidecar = (files: FileStore, romFile: string, id: AssetSourceId, bytes: Uint8Array): Promise<void> =>
  files.writeBytes(sidecarPath(romFile, id), bytes);

/** Drop a sidecar whose source ROM is gone, so a stale supplement never outlives its cartridge. */
const removeSidecar = (files: FileStore, romFile: string, id: AssetSourceId): Promise<void> =>
  files.remove(sidecarPath(romFile, id));

const readRomBytes = (files: FileStore, romFile: string): Promise<Uint8Array | null> => files.readBytes(`roms/${romFile}`);

/** Bytes of each supplement cartridge the user has imported, keyed by source id. */
const readSupplementRoms = async (files: FileStore): Promise<Partial<Record<AssetSourceId, Uint8Array>>> => {
  const out: Partial<Record<AssetSourceId, Uint8Array>> = {};
  for (const id of SUPPLEMENT_IDS) {
    const file = await supplementRomFile(files, id);
    if (!file) continue;
    const bytes = await files.readBytes(`roms/${file}`);
    if (bytes) out[id] = bytes;
  }
  return out;
};

/**
 * Every stored language set, with the font pair it bakes with — the extras for
 * one asset recompile, in the order the set list reports. Reads the EDITED set
 * files, so a translator's saved changes are what lands in the blob; a folder
 * missing either the set payload or its font pair is skipped as incomplete.
 * Compiling them is the caller's job (`compileSets`), since that runs off this
 * thread in the renderer.
 */
const readLanguageSets = async (files: FileStore): Promise<SetBakeInput[]> => {
  const out: SetBakeInput[] = [];
  for (const { id } of await listSets(files)) {
    const set = await getSet(files, id);
    const font = await getSetFont(files, id);
    if (!set || !font) continue;
    out.push({ set, fontData: font.fontData, fontWidth: font.fontWidth });
  }
  return out;
};

export {
  check,
  datName,
  load,
  readLanguageSets,
  readRomBytes,
  readSupplementRoms,
  removeSidecar,
  sidecarName,
  supplementRomFile,
  writeDat,
  writeSidecar,
};
