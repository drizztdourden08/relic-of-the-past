/* @layer shared-storage @kind logic */
/**
 * ROMs store over FileStore: list/status/info/delete + byte-based import (ZIP via
 * jszip or raw), mirroring the Electron layout (roms/<file>, assets/<stem>.dat).
 * Deleting a base ROM cascades to profiles that use it (via the profile store).
 *
 * Every import is explicit about its kind. A supplement cartridge used to be picked up by
 * scanning this folder for the first file ending in `.gba`, so a stray or wrong-revision
 * file was adopted silently and then failed deep inside the asset compile, taking the base
 * game's assets down with it. Kind and digest are settled here, at import, where the user
 * can still be told which file was refused and why.
 */
import type { FileStore } from '@shared/platform';
import { SUPPLEMENT_IDS } from '@shared/asset-extraction/sources/source-ids';
import { sha256Hex } from './hash';
import { isZip, unzip } from './archive';
import { listProfiles, deleteProfile } from './profiles';
import { ROM_KINDS, isBaseRom, kindOfFile } from './rom-kinds';
import { datName, sidecarName } from './assets';
import type { RomKind } from './rom-kinds';

type RomImportResult = { success: boolean; romFile: string; error?: string; alreadyExists?: boolean };
type ImportPhase = (phase: 'extract' | 'copy', loaded?: number, total?: number) => void;
type RomEntry = { romFile: string; kind: RomKind };
type RomStatus = { romFile: string; hasAssets: boolean; assetSize: number | null };
type SupplementStatus = { romFile: string; kind: RomKind; attachedTo: string[]; bytes: number | null };

/** Extensions offered by the picker for a kind (no leading dots). */
const pickExtensionsFor = (kind: RomKind): readonly string[] => ROM_KINDS[kind].pickExtensions;

/** Kept for call sites that only ever meant the base cartridge. */
const ROM_PICK_EXTENSIONS = pickExtensionsFor('snes-alttp');

const listEntries = async (files: FileStore): Promise<RomEntry[]> =>
  (await files.list('roms')).flatMap((romFile) => {
    const kind = kindOfFile(romFile);
    return kind ? [{ romFile, kind }] : [];
  });

const listRoms = async (files: FileStore, kind: RomKind = 'snes-alttp'): Promise<string[]> =>
  (await listEntries(files)).filter((entry) => entry.kind === kind).map((entry) => entry.romFile);

/** Base cartridges and whether their blob is built. Supplements have no blob of their own. */
const listWithStatus = async (files: FileStore): Promise<RomStatus[]> => {
  const out: RomStatus[] = [];
  for (const romFile of await listRoms(files, 'snes-alttp')) {
    const stat = await files.stat(`assets/${datName(romFile)}`);
    const hasAssets = !!stat && stat.bytes > 0;
    out.push({ romFile, hasAssets, assetSize: hasAssets ? stat!.bytes : null });
  }
  return out;
};

/** Supplement cartridges, and which base blobs currently carry their sidecar. */
const listSupplements = async (files: FileStore): Promise<SupplementStatus[]> => {
  const bases = await listRoms(files, 'snes-alttp');
  const out: SupplementStatus[] = [];

  for (const entry of await listEntries(files)) {
    const spec = ROM_KINDS[entry.kind];
    if (spec.role !== 'supplement' || !spec.sourceId) continue;

    const attachedTo: string[] = [];
    let bytes: number | null = null;
    for (const base of bases) {
      const stat = await files.stat(`assets/${sidecarName(base, spec.sourceId)}`);
      if (!stat || stat.bytes <= 0) continue;
      attachedTo.push(base);
      bytes = stat.bytes;
    }
    out.push({ romFile: entry.romFile, kind: entry.kind, attachedTo, bytes });
  }
  return out;
};

const getInfo = async (files: FileStore, romFile: string): Promise<{ name: string; size: number; hash: string; created: string; modified: string } | null> => {
  const stat = await files.stat(`roms/${romFile}`);
  const bytes = await files.readBytes(`roms/${romFile}`);
  if (!stat || !bytes) return null;
  const hash = (await sha256Hex(bytes)).slice(0, 16);
  const iso = new Date(stat.mtimeMs).toISOString();
  return { name: romFile, size: stat.bytes, hash, created: iso, modified: iso };
};

/**
 * Deleting a base cartridge takes its blob and its profiles with it, as before. Deleting a
 * supplement only drops the sidecars it produced — the base game is untouched, which is the
 * whole point of the two being separate files.
 */
const deleteRom = async (files: FileStore, romFile: string): Promise<void> => {
  await files.remove(`roms/${romFile}`);

  if (!isBaseRom(romFile)) {
    const spec = ROM_KINDS[kindOfFile(romFile) ?? 'gba-alttp'];
    if (spec.sourceId) {
      for (const base of await listRoms(files, 'snes-alttp')) {
        await files.remove(`assets/${sidecarName(base, spec.sourceId)}`);
      }
    }
    return;
  }

  await files.remove(`assets/${datName(romFile)}`);
  for (const id of SUPPLEMENT_IDS) await files.remove(`assets/${sidecarName(romFile, id)}`);
  for (const profile of await listProfiles(files)) {
    if (profile.romFile === romFile) await deleteProfile(files, profile.id);
  }
};

const resolveCandidate = async (
  fileName: string,
  bytes: Uint8Array,
  kind: RomKind,
  onPhase?: ImportPhase,
): Promise<{ ok: true; name: string; bytes: Uint8Array } | { ok: false; error: string }> => {
  const spec = ROM_KINDS[kind];
  const pretty = spec.pickExtensions.filter((ext) => ext !== 'zip').map((ext) => `.${ext}`).join('/');

  if (isZip(bytes)) {
    onPhase?.('extract');
    const found = (await unzip(bytes)).filter((entry) => spec.pattern.test(entry.name));
    if (found.length === 0) return { ok: false, error: `No ${pretty} file found in the archive` };
    if (found.length > 1) return { ok: false, error: `Multiple ${pretty} files found (${found.length}). Provide exactly one.` };
    return { ok: true, name: found[0].name, bytes: found[0].bytes };
  }

  if (spec.pattern.test(fileName)) return { ok: true, name: fileName, bytes };
  if (bytes.length === 0 || bytes.length > spec.maxBytes) return { ok: false, error: `File is not a valid ${spec.label} or archive` };
  return { ok: true, name: `${kind}-${bytes.length}${pretty.split('/')[0]}`, bytes };
};

/**
 * Import raw bytes (a chosen file or a download) as a given kind.
 *
 * Never overwrites: an existing destination is reported as `alreadyExists` and the bytes on
 * disk are left exactly as they are.
 */
const importBytes = async (
  files: FileStore,
  fileName: string,
  bytes: Uint8Array,
  kind: RomKind = 'snes-alttp',
  onPhase?: ImportPhase,
): Promise<RomImportResult> => {
  const spec = ROM_KINDS[kind];
  const candidate = await resolveCandidate(fileName, bytes, kind, onPhase);
  if (!candidate.ok) return { success: false, error: candidate.error, romFile: '' };

  if (spec.accepts.length > 0) {
    const sha = await sha256Hex(candidate.bytes);
    if (!spec.accepts.includes(sha)) {
      return {
        success: false,
        romFile: '',
        error: `Not a recognised ${spec.label} (SHA-256 ${sha.slice(0, 16)}…). This build only accepts the revision it was reverse-engineered against.`,
      };
    }
  }

  const dest = `roms/${candidate.name}`;
  if (await files.exists(dest)) return { success: true, romFile: candidate.name, alreadyExists: true };
  onPhase?.('copy');
  await files.writeBytes(dest, candidate.bytes);
  return { success: true, romFile: candidate.name, alreadyExists: false };
};

export {
  ROM_PICK_EXTENSIONS,
  deleteRom,
  getInfo,
  importBytes,
  listEntries,
  listRoms,
  listSupplements,
  listWithStatus,
  pickExtensionsFor,
};
export type { RomEntry, RomImportResult, RomStatus, SupplementStatus };
