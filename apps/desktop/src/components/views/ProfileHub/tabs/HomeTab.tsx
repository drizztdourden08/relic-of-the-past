import { useState, useEffect, useCallback } from 'react';
import type { PlaySession } from '@shared/types/session';
import type { NormalSaveInfo, AutoSaveInfo } from '@shared/types/saves';
import { SaveSlot } from '../../../compounds/SaveSlot';
import { NormalSaveCard } from '../../../compounds/NormalSaveCard';
import { AutoSaveCard } from '../../../compounds/AutoSaveCard';
import { HeroSaveCard } from '../../../compounds/HeroSaveCard';
import { PlaySessionCard } from '../../../compounds/PlaySessionCard';
import { Dialog } from '../../../composites/Dialog';
import { listSessions } from '../../../../lib/game/session-tracker';
import { saveState, loadState, subscribeGameState, captureStateBuffer, loadStateFromBuffer } from '../../../../lib/game';
import { log } from '../../../../lib/log-bus';
import './HomeTab.css';

const QUICK_SAVE_SLOTS = 12;

const formatRelativeTime = (ts: number | undefined): string => {
  if (!ts) return 'Never';
  const diffMs = Date.now() - ts;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(ts).toLocaleDateString();
};

const defaultSaveName = (): string => {
  return `Save - ${new Date().toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })}`;
};

interface HomeTabProps {
  profileId: string;
  romFile: string;
  isGameRunning: boolean;
  onStartGame: () => void;
  lastPlayed?: number;
  created?: number;
  windowMode?: string;
}

interface SlotInfo {
  slot: number;
  timestamp: number | null;
  screenshot: string | null;
}

interface DialogState {
  type: 'overwrite' | 'delete' | 'create' | null;
  targetId?: string;
  targetName?: string;
}

const HomeTab = (props: HomeTabProps) => {
  const {
    profileId,
    romFile,
    isGameRunning,
    onStartGame,
    lastPlayed,
    created,
    windowMode,
  } = props;

  // ─── Quick saves state ───
  const [slots, setSlots] = useState<SlotInfo[]>(() =>
    Array.from({ length: QUICK_SAVE_SLOTS }, (_, i) => ({ slot: i, timestamp: null, screenshot: null }))
  );
  const [busySlot, setBusySlot] = useState<number | null>(null);

  // ─── Normal saves state ───
  const [normalSaves, setNormalSaves] = useState<NormalSaveInfo[]>([]);
  const [normalScreenshots, setNormalScreenshots] = useState<Record<string, string>>({});
  const [busyNormal, setBusyNormal] = useState<string | null>(null);

  // ─── Auto-saves state ───
  const [autoSaves, setAutoSaves] = useState<AutoSaveInfo[]>([]);
  const [autoScreenshots, setAutoScreenshots] = useState<Record<string, string>>({});
  const [busyAuto, setBusyAuto] = useState<string | null>(null);

  // ─── Sessions ───
  const [sessions, setSessions] = useState<PlaySession[]>([]);

  // ─── Dialogs ───
  const [dialog, setDialog] = useState<DialogState>({ type: null });
  const [newSaveName, setNewSaveName] = useState('');

  // ─── Load data ───
  useEffect(() => {
    loadQuickSlots();
    loadNormalSaves();
    loadAutoSaves();
    loadSessions();
  }, [profileId]);

  const loadQuickSlots = async () => {
        try {
          const infos = await window.api.getSlotInfos(profileId);
          const loaded: SlotInfo[] = [];
          for (let i = 0; i < QUICK_SAVE_SLOTS; i++) {
            const info = infos?.find((s: { slot: number }) => s.slot === i);
            let screenshot: string | null = null;
            if (info?.hasScreenshot) {
              try {
                const b64 = await window.api.readScreenshot(profileId, i);
                if (b64) screenshot = `data:image/png;base64,${b64}`;
              } catch { /* ignore */ }
            }
            loaded.push({ slot: i, timestamp: info?.timestamp ?? null, screenshot });
          }
          setSlots(loaded);
        } catch { /* ignore */ }
      };

  const loadNormalSaves = async () => {
        try {
          const list: NormalSaveInfo[] = await window.api.listNormalSaves(profileId);
          setNormalSaves(list);
          // Load screenshots
          const screenshots: Record<string, string> = {};
          for (const save of list) {
            if (save.hasScreenshot) {
              try {
                const b64 = await window.api.loadNormalScreenshot(profileId, save.id);
                if (b64) screenshots[save.id] = `data:image/png;base64,${b64}`;
              } catch { /* ignore */ }
            }
          }
          setNormalScreenshots(screenshots);
        } catch { /* ignore */ }
      };

  const loadAutoSaves = async () => {
        try {
          const list = await window.api.listAutoSaves(profileId) as AutoSaveInfo[];
          setAutoSaves(list);
          const screenshots: Record<string, string> = {};
          for (const save of list) {
            if (save.hasScreenshot) {
              try {
                const b64 = await window.api.loadAutoScreenshot(profileId, save.id);
                if (b64) screenshots[save.id] = `data:image/png;base64,${b64}`;
              } catch { /* ignore */ }
            }
          }
          setAutoScreenshots(screenshots);
        } catch { /* ignore */ }
      };

  const loadSessions = async () => {
        const list = await listSessions(profileId);
        setSessions(list.slice(0, 20));
      };

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
    if (!isGameRunning) {
      onStartGame();
      await new Promise<void>((resolve) => {
        const unsub = subscribeGameState((state) => {
          if (state.status === 'running' || state.status === 'error') {
            unsub();
            resolve();
          }
        });
      });
    }
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

    // Capture screenshot (DOM concern — stays in the view)
    let screenshot: ArrayBuffer | undefined;
    const canvas = document.querySelector('.game-layer__canvas') as HTMLCanvasElement | null;
    if (canvas) {
      try {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
        if (blob) screenshot = await blob.arrayBuffer();
      } catch { /* ignore */ }
    }

    await window.api.createNormalSave(profileId, name, ab, screenshot);
    await loadNormalSaves();
    setBusyNormal(null);
  }, [profileId, newSaveName]);

  const handleLoadNormal = useCallback(async (id: string) => {
    setBusyNormal(id);
    log.app(`Loading normal save: ${id}`);
    if (!isGameRunning) {
      onStartGame();
      await new Promise<void>((resolve) => {
        const unsub = subscribeGameState((state) => {
          if (state.status === 'running' || state.status === 'error') {
            unsub();
            resolve();
          }
        });
      });
    }
    const buffer = await window.api.loadNormalSave(profileId, id);
    if (buffer) loadStateFromBuffer(buffer);
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

    let screenshot: ArrayBuffer | undefined;
    const canvas = document.querySelector('.game-layer__canvas') as HTMLCanvasElement | null;
    if (canvas) {
      try {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
        if (blob) screenshot = await blob.arrayBuffer();
      } catch { /* ignore */ }
    }

    await window.api.overwriteNormalSave(profileId, id, ab, screenshot);
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
    await window.api.deleteNormalSave(profileId, id);
    await loadNormalSaves();
    setBusyNormal(null);
  }, [profileId, dialog]);

  const handleRenameNormal = useCallback(async (id: string, newName: string) => {
    await window.api.renameNormalSave(profileId, id, newName);
    await loadNormalSaves();
  }, [profileId]);

  // ─── Auto-save handlers ───
  const handleLoadAuto = useCallback(async (id: string) => {
    setBusyAuto(id);
    log.app(`Loading auto-save: ${id}`);
    if (!isGameRunning) {
      onStartGame();
      await new Promise<void>((resolve) => {
        const unsub = subscribeGameState((state) => {
          if (state.status === 'running' || state.status === 'error') {
            unsub();
            resolve();
          }
        });
      });
    }
    const buffer = await window.api.loadAutoSave(profileId, id);
    if (buffer) loadStateFromBuffer(buffer);
    setBusyAuto(null);
  }, [profileId, isGameRunning, onStartGame]);

  const handleDeleteAuto = useCallback(async (id: string) => {
    setBusyAuto(id);
    await window.api.deleteAutoSave(profileId, id);
    await loadAutoSaves();
    setBusyAuto(null);
  }, [profileId]);

  // ─── Derived: hero card (most recent normal save) ───
  const heroSave = normalSaves[0] ?? null;

  return (
    <div className="home-tab">
      {/* Info cards */}
      <div className="home-tab__info-cards">
        <div className="home-tab__info-card">
          <span className="home-tab__info-label">ROM</span>
          <span className="home-tab__info-value">{romFile.replace(/\.(sfc|smc)$/i, '')}</span>
        </div>
        <div className="home-tab__info-card">
          <span className="home-tab__info-label">Last Played</span>
          <span className="home-tab__info-value">{formatRelativeTime(lastPlayed)}</span>
        </div>
        <div className="home-tab__info-card">
          <span className="home-tab__info-label">Created</span>
          <span className="home-tab__info-value">{formatRelativeTime(created)}</span>
        </div>
        {windowMode && (
          <div className="home-tab__info-card">
            <span className="home-tab__info-label">Window</span>
            <span className="home-tab__info-value" style={{ textTransform: 'capitalize' }}>{windowMode}</span>
          </div>
        )}
      </div>

      {/* Hero card — last normal save */}
      {heroSave && (
        <HeroSaveCard
          name={heroSave.name}
          timestamp={heroSave.timestamp}
          screenshotUrl={normalScreenshots[heroSave.id] ?? null}
          onLoad={() => handleLoadNormal(heroSave.id)}
          busy={busyNormal === heroSave.id}
        />
      )}

      {/* Two-column layout: Quick saves (left) | Normal + Auto saves (right) */}
      <div className="home-tab__columns">
        {/* Left column: Quick Saves + Play Sessions */}
        <div className="home-tab__col-left">
          <section className="home-tab__section">
            <h3 className="home-tab__section-title">Quick Saves</h3>
            <div className="home-tab__save-grid">
              {slots.map((s) => (
                <SaveSlot
                  key={s.slot}
                  slot={s.slot}
                  screenshotUrl={s.screenshot}
                  timestamp={s.timestamp ?? 0}
                  isEmpty={!s.timestamp}
                  busy={busySlot === s.slot}
                  disableSave={!isGameRunning}
                  onSave={handleQuickSave}
                  onLoad={handleQuickLoad}
                />
              ))}
            </div>
          </section>

          <section className="home-tab__section">
            <h3 className="home-tab__section-title">Play Sessions</h3>
            {sessions.length === 0 ? (
              <p className="home-tab__empty">No play sessions yet</p>
            ) : (
              <div className="home-tab__sessions">
                {sessions.map((s) => (
                  <PlaySessionCard key={s.id} session={s} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column: Normal Saves + Auto Saves */}
        <div className="home-tab__col-right">
          <section className="home-tab__section">
            <div className="home-tab__section-header">
              <h3 className="home-tab__section-title">Saves</h3>
              <button
                className="home-tab__new-save-btn"
                onClick={handleCreateNormalSave}
                disabled={!isGameRunning}
                title={isGameRunning ? 'Create a new save' : 'Start game to save'}
              >
                + New Save
              </button>
            </div>
            {normalSaves.length === 0 ? (
              <p className="home-tab__empty">No saves yet</p>
            ) : (
              <div className="home-tab__save-list">
                {normalSaves.map((s) => (
                  <NormalSaveCard
                    key={s.id}
                    id={s.id}
                    name={s.name}
                    timestamp={s.timestamp}
                    screenshotUrl={normalScreenshots[s.id] ?? null}
                    busy={busyNormal === s.id}
                    isGameRunning={isGameRunning}
                    onLoad={handleLoadNormal}
                    onOverwrite={handleOverwriteNormal}
                    onDelete={handleDeleteNormal}
                    onRename={handleRenameNormal}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="home-tab__section">
            <h3 className="home-tab__section-title">Auto-Saves</h3>
            {autoSaves.length === 0 ? (
              <p className="home-tab__empty">No auto-saves yet</p>
            ) : (
              <div className="home-tab__save-list">
                {autoSaves.map((s) => (
                  <AutoSaveCard
                    key={s.id}
                    id={s.id}
                    timestamp={s.timestamp}
                    trigger={s.trigger}
                    screenshotUrl={autoScreenshots[s.id] ?? null}
                    busy={busyAuto === s.id}
                    onLoad={handleLoadAuto}
                    onDelete={handleDeleteAuto}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog
        open={dialog.type === 'create'}
        title="Create Save"
        message=""
        confirmLabel="Save"
        cancelLabel="Cancel"
        onConfirm={handleConfirmCreate}
        onCancel={() => setDialog({ type: null })}
      >
        <input
          className="home-tab__save-name-input"
          value={newSaveName}
          onChange={(e) => setNewSaveName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmCreate(); }}
          placeholder="Save name..."
          maxLength={64}
          autoFocus
        />
      </Dialog>

      <Dialog
        open={dialog.type === 'overwrite'}
        title="Overwrite Save"
        message={`Overwrite "${dialog.targetName}"? This cannot be undone.`}
        confirmLabel="Overwrite"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmOverwrite}
        onCancel={() => setDialog({ type: null })}
      />

      <Dialog
        open={dialog.type === 'delete'}
        title="Delete Save"
        message={`Delete "${dialog.targetName}"? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDialog({ type: null })}
      />
    </div>
  );
}

export { HomeTab };
