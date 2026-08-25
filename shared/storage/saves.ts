/* @layer shared-storage @kind logic */
/**
 * SRAM, quick states, and normal/auto saves over FileStore. Mirrors the exact
 * Electron layout under `profiles/<id>/saves/` (sram.dat+bak, quick/save{N}.sav+png,
 * normal/ + auto/ manifests), so existing desktop saves load unchanged.
 */
import type { FileStore } from '@shared/platform';
import type { NormalSaveInfo, AutoSaveInfo, QuickSaveSlotInfo } from '@shared/types/saves';
import { newId } from './id';
import { createManifestSaves } from './save-manifest';
import { deleteMsuResume } from './msu-resume';
import { quickDir, savesDir } from './save-paths';

const QUICK_SLOTS = 12;
const AUTO_DEFAULT_MAX = 5;
const AUTO_ABS_MAX = 20;

// ── SRAM (with single-backup rotation) ──
const writeSram = async (files: FileStore, p: string, data: Uint8Array): Promise<void> => {
  const prev = await files.readBytes(`${savesDir(p)}/sram.dat`);
  if (prev) await files.writeBytes(`${savesDir(p)}/sram.bak`, prev);
  await files.writeBytes(`${savesDir(p)}/sram.dat`, data);
};
const readSram = (files: FileStore, p: string): Promise<Uint8Array | null> => files.readBytes(`${savesDir(p)}/sram.dat`);

// ── Quick states (slots 0-11) ──
// A quick slot is written over in place, so its music-resume sidecar has to go with
// the state it described. A caller with a fresh snapshot writes it after this call.
const writeState = async (files: FileStore, p: string, slot: number, data: Uint8Array): Promise<void> => {
  await files.writeBytes(`${quickDir(p)}/save${slot}.sav`, data);
  await deleteMsuResume(files, p, 'quick', slot);
};
const readState = (files: FileStore, p: string, slot: number): Promise<Uint8Array | null> =>
  files.readBytes(`${quickDir(p)}/save${slot}.sav`);
const writeScreenshot = (files: FileStore, p: string, slot: number, data: Uint8Array): Promise<void> =>
  files.writeBytes(`${quickDir(p)}/save${slot}.png`, data);
const readScreenshot = (files: FileStore, p: string, slot: number): Promise<Uint8Array | null> =>
  files.readBytes(`${quickDir(p)}/save${slot}.png`);

const listStates = async (files: FileStore, p: string): Promise<number[]> => {
  const names = await files.list(quickDir(p));
  return names.filter((n) => /^save\d+\.sav$/.test(n))
    .map((n) => parseInt(n.match(/^save(\d+)\.sav$/)![1], 10))
    .sort((a, b) => a - b);
};

// Legacy: move save{N}.(sav|png) from saves/ root into saves/quick/.
const migrateQuick = async (files: FileStore, p: string): Promise<void> => {
  const root = await files.list(savesDir(p));
  for (const f of root.filter((n) => /^save\d+\.(sav|png)$/.test(n))) {
    const dest = `${quickDir(p)}/${f}`;
    if (await files.exists(dest)) continue;
    const bytes = await files.readBytes(`${savesDir(p)}/${f}`);
    if (bytes) { await files.writeBytes(dest, bytes); await files.remove(`${savesDir(p)}/${f}`); }
  }
};

const getSlotInfos = async (files: FileStore, p: string): Promise<QuickSaveSlotInfo[]> => {
  await migrateQuick(files, p);
  const out: QuickSaveSlotInfo[] = [];
  for (let slot = 0; slot < QUICK_SLOTS; slot += 1) {
    const stat = await files.stat(`${quickDir(p)}/save${slot}.sav`);
    if (!stat) continue;
    out.push({ slot, timestamp: stat.mtimeMs, size: stat.bytes, hasScreenshot: await files.exists(`${quickDir(p)}/save${slot}.png`) });
  }
  return out;
};

// ── Normal saves ──
type NormalEntry = { id: string; name: string; timestamp: number };
const normal = (files: FileStore, p: string) => createManifestSaves<NormalEntry>(files, `${savesDir(p)}/normal`);

const createNormalSave = async (files: FileStore, p: string, name: string, data: Uint8Array, screenshot?: Uint8Array): Promise<NormalSaveInfo> => {
  const entry: NormalEntry = { id: newId(), name, timestamp: Date.now() };
  await normal(files, p).append(entry, data, screenshot);
  return { id: entry.id, name, timestamp: entry.timestamp, size: data.byteLength, hasScreenshot: !!screenshot };
};
const listNormalSaves = async (files: FileStore, p: string): Promise<NormalSaveInfo[]> =>
  (await normal(files, p).valid()).map((v) => ({ id: v.entry.id, name: v.entry.name, timestamp: v.entry.timestamp, size: v.bytes, hasScreenshot: v.hasScreenshot }));
const loadNormalSave = (files: FileStore, p: string, id: string): Promise<Uint8Array | null> => normal(files, p).load(id);
const loadNormalScreenshot = (files: FileStore, p: string, id: string): Promise<Uint8Array | null> => normal(files, p).loadScreenshot(id);
const deleteNormalSave = (files: FileStore, p: string, id: string): Promise<void> => normal(files, p).remove(id);
const overwriteNormalSave = async (files: FileStore, p: string, id: string, data: Uint8Array, screenshot?: Uint8Array): Promise<NormalSaveInfo | null> => {
  const s = normal(files, p);
  const manifest = await s.readManifest();
  const entry = manifest.find((e) => e.id === id);
  if (!entry) return null;
  entry.timestamp = Date.now();
  await s.writePair(id, data, screenshot);
  await s.writeManifest(manifest);
  return { id, name: entry.name, timestamp: entry.timestamp, size: data.byteLength, hasScreenshot: !!screenshot };
};
const renameNormalSave = async (files: FileStore, p: string, id: string, newName: string): Promise<NormalSaveInfo | null> => {
  const s = normal(files, p);
  const manifest = await s.readManifest();
  const entry = manifest.find((e) => e.id === id);
  if (!entry) return null;
  entry.name = newName;
  await s.writeManifest(manifest);
  const stat = await files.stat(s.sav(id));
  if (!stat) return null;
  return { id, name: newName, timestamp: entry.timestamp, size: stat.bytes, hasScreenshot: await files.exists(s.png(id)) };
};

// ── Auto saves ──
type AutoEntry = { id: string; timestamp: number; trigger: 'timer' | 'quit' };
const auto = (files: FileStore, p: string) => createManifestSaves<AutoEntry>(files, `${savesDir(p)}/auto`);

const createAutoSave = async (files: FileStore, p: string, trigger: 'timer' | 'quit', data: Uint8Array, screenshot?: Uint8Array): Promise<AutoSaveInfo> => {
  const timestamp = Date.now();
  const entry: AutoEntry = { id: String(timestamp), timestamp, trigger };
  await auto(files, p).append(entry, data, screenshot);
  return { id: entry.id, timestamp, size: data.byteLength, trigger, hasScreenshot: !!screenshot };
};
const listAutoSaves = async (files: FileStore, p: string): Promise<AutoSaveInfo[]> =>
  (await auto(files, p).valid()).map((v) => ({ id: v.entry.id, timestamp: v.entry.timestamp, size: v.bytes, trigger: v.entry.trigger, hasScreenshot: v.hasScreenshot }));
const loadAutoSave = (files: FileStore, p: string, id: string): Promise<Uint8Array | null> => auto(files, p).load(id);
const loadAutoScreenshot = (files: FileStore, p: string, id: string): Promise<Uint8Array | null> => auto(files, p).loadScreenshot(id);
const deleteAutoSave = (files: FileStore, p: string, id: string): Promise<void> => auto(files, p).remove(id);
const pruneAutoSaves = async (files: FileStore, p: string, maxEntries?: number): Promise<void> => {
  const s = auto(files, p);
  const max = Math.min(maxEntries ?? AUTO_DEFAULT_MAX, AUTO_ABS_MAX);
  const manifest = await s.readManifest();
  if (manifest.length <= max) return;
  const sorted = [...manifest].sort((a, b) => a.timestamp - b.timestamp);
  for (const entry of sorted.slice(0, sorted.length - max)) await s.remove(entry.id);
};

export {
  writeSram, readSram, writeState, readState, writeScreenshot, readScreenshot, listStates, getSlotInfos,
  createNormalSave, listNormalSaves, loadNormalSave, loadNormalScreenshot, deleteNormalSave, overwriteNormalSave, renameNormalSave,
  createAutoSave, listAutoSaves, loadAutoSave, loadAutoScreenshot, deleteAutoSave, pruneAutoSaves,
};
