/* @layer renderer-components @kind hook */
/** All Home-tab save/session state, data loading, and action handlers. */
import { useState, useEffect, useCallback } from 'react';
import { usePlatform } from '@app/platform';
import type { NormalSaveInfo, AutoSaveInfo } from '@shared/types/saves';
import type { PlaySession } from '@shared/types/session';
import { saveState, loadState, captureStateBuffer, loadStateFromBuffer } from '../../../../../../../lib/game';
import { saveMusicPosition, restoreMusicPosition } from '../../../../../../../lib/game/msu-save-glue';
import { listSessions } from '../../../../../../../lib/game/session-tracker';
import { log } from '../../../../../../../lib/log-bus';
import * as savesStore from '@app/lib/storage/saves-store';
import type { SlotInfo, DialogState } from './home-tab.type';
import { QUICK_SAVE_SLOTS, defaultSaveName, ensureGameRunning, captureCanvasScreenshot } from './home-tab-helpers';
import { fetchQuickSlots, fetchNormalSaves, fetchAutoSaves } from './home-tab-data';
import { useHomeTabToasts } from './useHomeTabToasts';
import { useHomeTabSramImport } from './useHomeTabSramImport';

const useHomeTabSaves = (params: { profileId: string; isGameRunning: boolean; onStartGame: () => void }) => {
  const { profileId, isGameRunning, onStartGame } = params;
  const { filePicker } = usePlatform();
  const { toasts, showToast, dismissToast } = useHomeTabToasts();

  const [slots, setSlots] = useState<SlotInfo[]>(() =>
    Array.from({ length: QUICK_SAVE_SLOTS }, (_, i) => ({ slot: i, timestamp: null, screenshot: null }))
  );
  const [busySlot, setBusySlot] = useState<number | null>(null);
  const [normalSaves, setNormalSaves] = useState<NormalSaveInfo[]>([]);
  const [normalScreenshots, setNormalScreenshots] = useState<Record<string, string>>({});
  const [busyNormal, setBusyNormal] = useState<string | null>(null);
  const [autoSaves, setAutoSaves] = useState<AutoSaveInfo[]>([]);
  const [autoScreenshots, setAutoScreenshots] = useState<Record<string, string>>({});
  const [busyAuto, setBusyAuto] = useState<string | null>(null);
  const [sessions, setSessions] = useState<PlaySession[]>([]);
  const [dialog, setDialog] = useState<DialogState>({ type: null });
  const [newSaveName, setNewSaveName] = useState('');
  const {
    importConfirmText, setImportConfirmText, handleImportSram, handleCancelImportSram, handleConfirmImportSram,
  } = useHomeTabSramImport({ profileId, filePicker, dialog, setDialog, showToast });

  const loadQuickSlots = async () => { const d = await fetchQuickSlots(profileId); if (d) setSlots(d); };
  const loadNormalSaves = async () => {
    const d = await fetchNormalSaves(profileId);
    if (d) { setNormalSaves(d.list); setNormalScreenshots(d.screenshots); }
  };
  const loadAutoSaves = async () => {
    const d = await fetchAutoSaves(profileId);
    if (d) { setAutoSaves(d.list); setAutoScreenshots(d.screenshots); }
  };
  const loadSessions = async () => {
    const list = await listSessions(profileId);
    setSessions(list.slice(0, 20));
  };

  useEffect(() => {
    loadQuickSlots();
    loadNormalSaves();
    loadAutoSaves();
    loadSessions();
  }, [profileId]);

  // ─── Quick save handlers ───
  const handleQuickSave = useCallback(async (slot: number) => {
    setBusySlot(slot);
    log.app(`Saving state to slot ${slot + 1}`);
    await saveState(slot);
    await loadQuickSlots();
    setBusySlot(null);
  }, [profileId]);

  const handleQuickLoad = useCallback(async (slot: number) => {
    setBusySlot(slot);
    log.app(`Loading state from slot ${slot + 1}`);
    await ensureGameRunning(isGameRunning, onStartGame);
    await loadState(slot);
    setBusySlot(null);
  }, [profileId, isGameRunning, onStartGame]);

  // ─── Normal save handlers ───
  const handleCreateNormalSave = useCallback(() => {
    setNewSaveName(defaultSaveName());
    setDialog({ type: 'create' });
  }, []);

  const handleConfirmCreate = useCallback(async () => {
    setDialog({ type: null });
    const name = newSaveName.trim() || defaultSaveName();
    setBusyNormal('__creating__');
    log.app(`Creating normal save: "${name}"`);
    const ab = captureStateBuffer();
    if (!ab) { setBusyNormal(null); return; }
    const screenshot = await captureCanvasScreenshot();
    const created = await savesStore.createNormalSave(profileId, name, ab, screenshot);
    if (created?.id) await saveMusicPosition(profileId, 'normal', created.id);
    await loadNormalSaves();
    setBusyNormal(null);
  }, [profileId, newSaveName]);

  const handleLoadNormal = useCallback(async (id: string) => {
    setBusyNormal(id);
    log.app(`Loading normal save: ${id}`);
    await ensureGameRunning(isGameRunning, onStartGame);
    const buffer = await savesStore.loadNormalSave(profileId, id);
    if (buffer) {
      loadStateFromBuffer(buffer);
      await restoreMusicPosition(profileId, 'normal', id);
    }
    setBusyNormal(null);
  }, [profileId, isGameRunning, onStartGame]);

  const handleOverwriteNormal = useCallback((id: string) => {
    const save = normalSaves.find((s) => s.id === id);
    setDialog({ type: 'overwrite', targetId: id, targetName: save?.name ?? 'this save' });
  }, [normalSaves]);

  const handleConfirmOverwrite = useCallback(async () => {
    const id = dialog.targetId;
    setDialog({ type: null });
    if (!id) return;
    setBusyNormal(id);
    log.app(`Overwriting normal save: ${id}`);
    const ab = captureStateBuffer();
    if (!ab) { setBusyNormal(null); return; }
    const screenshot = await captureCanvasScreenshot();
    await savesStore.overwriteNormalSave(profileId, id, ab, screenshot);
    await saveMusicPosition(profileId, 'normal', id);
    await loadNormalSaves();
    setBusyNormal(null);
  }, [profileId, dialog]);

  const handleDeleteNormal = useCallback((id: string) => {
    const save = normalSaves.find((s) => s.id === id);
    setDialog({ type: 'delete', targetId: id, targetName: save?.name ?? 'this save' });
  }, [normalSaves]);

  const handleConfirmDelete = useCallback(async () => {
    const id = dialog.targetId;
    setDialog({ type: null });
    if (!id) return;
    setBusyNormal(id);
    await savesStore.deleteNormalSave(profileId, id);
    await loadNormalSaves();
    setBusyNormal(null);
  }, [profileId, dialog]);

  const handleRenameNormal = useCallback(async (id: string, newName: string) => {
    await savesStore.renameNormalSave(profileId, id, newName);
    await loadNormalSaves();
  }, [profileId]);

  // ─── Auto-save handlers ───
  const handleLoadAuto = useCallback(async (id: string) => {
    setBusyAuto(id);
    log.app(`Loading auto-save: ${id}`);
    await ensureGameRunning(isGameRunning, onStartGame);
    const buffer = await savesStore.loadAutoSave(profileId, id);
    if (buffer) {
      loadStateFromBuffer(buffer);
      await restoreMusicPosition(profileId, 'auto', id);
    }
    setBusyAuto(null);
  }, [profileId, isGameRunning, onStartGame]);

  const handleDeleteAuto = useCallback(async (id: string) => {
    setBusyAuto(id);
    await savesStore.deleteAutoSave(profileId, id);
    await loadAutoSaves();
    setBusyAuto(null);
  }, [profileId]);

  const heroSave = normalSaves[0] ?? null;

  return {
    slots, busySlot, normalSaves, normalScreenshots, busyNormal, autoSaves, autoScreenshots, busyAuto, sessions,
    dialog, setDialog, newSaveName, setNewSaveName, heroSave, toasts, dismissToast,
    importConfirmText, setImportConfirmText,
    handleQuickSave, handleQuickLoad, handleCreateNormalSave, handleConfirmCreate, handleLoadNormal,
    handleOverwriteNormal, handleConfirmOverwrite, handleDeleteNormal, handleConfirmDelete, handleRenameNormal,
    handleLoadAuto, handleDeleteAuto, handleImportSram, handleCancelImportSram, handleConfirmImportSram,
  };
};

export { useHomeTabSaves };
export type { HomeTabSaves };

type HomeTabSaves = ReturnType<typeof useHomeTabSaves>;
