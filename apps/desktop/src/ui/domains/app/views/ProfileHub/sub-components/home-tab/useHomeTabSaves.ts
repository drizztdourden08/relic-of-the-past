/* @layer renderer-components @kind hook */
import { useState, useEffect, useCallback } from 'react';
import { usePlatform } from '@drizztdourden08/brock-react';
import type { NormalSaveInfo, AutoSaveInfo } from '@shared/types/saves';
import type { PlaySession } from '@shared/types/session';
import { saveState, loadState, captureStateBuffer, loadStateFromBuffer } from '../../../../../../../lib/game';
import { onAutoSavesChanged } from '../../../../../../../lib/game/auto-save';
import { saveMusicPosition, restoreMusicPosition } from '../../../../../../../lib/game/msu-save-glue';
import { listSessions } from '../../../../../../../lib/game/session-tracker';
import { log } from '../../../../../../../lib/log-bus';
import * as savesStore from '@app/lib/storage/saves-store';
import type { SlotInfo, DialogState, UseHomeTabSavesParams } from './home-tab.type';
import { QUICK_SAVE_SLOTS, SESSION_LIST_LIMIT } from './home-tab.constants';
import { defaultSaveName } from './default-save-name';
import { ensureGameRunning } from './ensure-game-running';
import { captureCanvasScreenshot } from './capture-canvas-screenshot';
import { fetchQuickSlots } from './fetch-quick-slots';
import { fetchNormalSaves } from './fetch-normal-saves';
import { fetchAutoSaves } from './fetch-auto-saves';
import { useHomeTabSramImport } from './useHomeTabSramImport';

const useHomeTabSaves = (params: UseHomeTabSavesParams) => {
  const { profileId, isGameRunning, onStartGame } = params;
  const { filePicker } = usePlatform();

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
  } = useHomeTabSramImport({ profileId, filePicker, dialog, setDialog });

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
    setSessions(list.slice(0, SESSION_LIST_LIMIT));
  };

  useEffect(() => {
    loadQuickSlots();
    loadNormalSaves();
    loadAutoSaves();
    loadSessions();
  }, [profileId]);

  useEffect(() => onAutoSavesChanged(() => { loadAutoSaves(); }), [profileId]);

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
    if (await ensureGameRunning(isGameRunning, onStartGame)) await loadState(slot);
    setBusySlot(null);
  }, [profileId, isGameRunning, onStartGame]);

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
    const ready = await ensureGameRunning(isGameRunning, onStartGame);
    const buffer = ready ? await savesStore.loadNormalSave(profileId, id) : null;
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

  const handleLoadAuto = useCallback(async (id: string) => {
    setBusyAuto(id);
    log.app(`Loading auto-save: ${id}`);
    const ready = await ensureGameRunning(isGameRunning, onStartGame);
    const buffer = ready ? await savesStore.loadAutoSave(profileId, id) : null;
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
    dialog, setDialog, newSaveName, setNewSaveName, heroSave,
    importConfirmText, setImportConfirmText,
    handleQuickSave, handleQuickLoad, handleCreateNormalSave, handleConfirmCreate, handleLoadNormal,
    handleOverwriteNormal, handleConfirmOverwrite, handleDeleteNormal, handleConfirmDelete, handleRenameNormal,
    handleLoadAuto, handleDeleteAuto, handleImportSram, handleCancelImportSram, handleConfirmImportSram,
  };
};

export { useHomeTabSaves };
export type { HomeTabSaves } from './home-tab.type';
