/* @layer renderer-lib @kind logic */
/**
 * Renderer saves store, bound to the platform FileStore. Mirrors the window.api
 * saves surface (ArrayBuffer in/out, base64 strings for screenshots) so call sites
 * swap 1:1, while persistence runs per-OS through the platform layer.
 */
import type { NormalSaveInfo, AutoSaveInfo, QuickSaveSlotInfo } from '@shared/types/saves';
import * as saves from '@shared/storage/saves';
import { getPlatform } from '@app/platform/get-platform';

const files = () => getPlatform().files;

const u8 = (ab: ArrayBuffer): Uint8Array => new Uint8Array(ab);
const toAb = (data: Uint8Array | null): ArrayBuffer | null =>
  data ? (data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer) : null;
const toBase64 = (data: Uint8Array | null): string | null => {
  if (!data) return null;
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < data.length; i += chunk) binary += String.fromCharCode(...data.subarray(i, i + chunk));
  return btoa(binary);
};
const optU8 = (ab?: ArrayBuffer): Uint8Array | undefined => (ab ? new Uint8Array(ab) : undefined);

const writeSram = (p: string, data: ArrayBuffer): Promise<void> => saves.writeSram(files(), p, u8(data));
const readSram = async (p: string): Promise<ArrayBuffer | null> => toAb(await saves.readSram(files(), p));
const writeState = (p: string, slot: number, data: ArrayBuffer): Promise<void> => saves.writeState(files(), p, slot, u8(data));
const readState = async (p: string, slot: number): Promise<ArrayBuffer | null> => toAb(await saves.readState(files(), p, slot));
const writeScreenshot = (p: string, slot: number, data: ArrayBuffer): Promise<void> => saves.writeScreenshot(files(), p, slot, u8(data));
const readScreenshot = async (p: string, slot: number): Promise<string | null> => toBase64(await saves.readScreenshot(files(), p, slot));
const listStates = (p: string): Promise<number[]> => saves.listStates(files(), p);
const getSlotInfos = (p: string): Promise<QuickSaveSlotInfo[]> => saves.getSlotInfos(files(), p);

const createNormalSave = (p: string, name: string, data: ArrayBuffer, screenshot?: ArrayBuffer): Promise<NormalSaveInfo> =>
  saves.createNormalSave(files(), p, name, u8(data), optU8(screenshot));
const listNormalSaves = (p: string): Promise<NormalSaveInfo[]> => saves.listNormalSaves(files(), p);
const loadNormalSave = async (p: string, id: string): Promise<ArrayBuffer | null> => toAb(await saves.loadNormalSave(files(), p, id));
const loadNormalScreenshot = async (p: string, id: string): Promise<string | null> => toBase64(await saves.loadNormalScreenshot(files(), p, id));
const overwriteNormalSave = (p: string, id: string, data: ArrayBuffer, screenshot?: ArrayBuffer): Promise<NormalSaveInfo | null> =>
  saves.overwriteNormalSave(files(), p, id, u8(data), optU8(screenshot));
const deleteNormalSave = (p: string, id: string): Promise<void> => saves.deleteNormalSave(files(), p, id);
const renameNormalSave = (p: string, id: string, newName: string): Promise<NormalSaveInfo | null> => saves.renameNormalSave(files(), p, id, newName);

const createAutoSave = (p: string, trigger: 'timer' | 'quit', data: ArrayBuffer, screenshot?: ArrayBuffer): Promise<AutoSaveInfo> =>
  saves.createAutoSave(files(), p, trigger, u8(data), optU8(screenshot));
const listAutoSaves = (p: string): Promise<AutoSaveInfo[]> => saves.listAutoSaves(files(), p);
const loadAutoSave = async (p: string, id: string): Promise<ArrayBuffer | null> => toAb(await saves.loadAutoSave(files(), p, id));
const loadAutoScreenshot = async (p: string, id: string): Promise<string | null> => toBase64(await saves.loadAutoScreenshot(files(), p, id));
const deleteAutoSave = (p: string, id: string): Promise<void> => saves.deleteAutoSave(files(), p, id);
const pruneAutoSaves = (p: string, maxEntries?: number): Promise<void> => saves.pruneAutoSaves(files(), p, maxEntries);

export {
  writeSram, readSram, writeState, readState, writeScreenshot, readScreenshot, listStates, getSlotInfos,
  createNormalSave, listNormalSaves, loadNormalSave, loadNormalScreenshot, overwriteNormalSave, deleteNormalSave, renameNormalSave,
  createAutoSave, listAutoSaves, loadAutoSave, loadAutoScreenshot, deleteAutoSave, pruneAutoSaves,
};
