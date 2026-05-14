import { useState, useEffect, useCallback, useRef } from 'react';
import { saveState, loadState, getActiveProfileId } from '../../../lib/game';
import { SaveSlot } from '../../compounds/SaveSlot';
import { log } from '../../../lib/log-bus';
import './SaveStateOverlay.css';

const SLOT_COUNT = 12;
const SHORTCUT_KEYS = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'];
const ANIM_MS = 180;

interface SlotInfo {
  slot: number;
  timestamp: number;
  size: number;
  hasScreenshot: boolean;
  screenshotUrl: string | null;
}

interface SaveStateOverlayProps {
  open: boolean;
  onClose: () => void;
  highlightedSlot?: number | null;
  holdProgress?: number; // 0-1 for the highlighted slot
  statusMessage?: string | null;
}

export function SaveStateOverlay({ open, onClose, highlightedSlot, holdProgress, statusMessage }: SaveStateOverlayProps): JSX.Element | null {
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [busy, setBusy] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState<'in' | 'out' | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const loadSlots = useCallback(async () => {
    const profileId = getActiveProfileId();
    if (!profileId) return;

    const infos = await window.api.getSlotInfos(profileId);

    const slotData: SlotInfo[] = [];
    for (let i = 0; i < SLOT_COUNT; i++) {
      const info = infos.find((s) => s.slot === i);
      let screenshotUrl: string | null = null;
      if (info?.hasScreenshot) {
        try {
          const b64 = await window.api.readScreenshot(profileId, i);
          if (b64) {
            screenshotUrl = 'data:image/png;base64,' + b64;
          }
        } catch { /* best effort */ }
      }
      slotData.push({
        slot: i,
        timestamp: info?.timestamp ?? 0,
        size: info?.size ?? 0,
        hasScreenshot: info?.hasScreenshot ?? false,
        screenshotUrl,
      });
    }
    setSlots(slotData);
  }, []);

  // Open/close with animation
  useEffect(() => {
    clearTimeout(timeoutRef.current);
    if (open) {
      setVisible(true);
      setAnimating('in');
      loadSlots();
      timeoutRef.current = setTimeout(() => setAnimating(null), ANIM_MS);
    } else if (visible) {
      setAnimating('out');
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
        setAnimating(null);
        setSlots([]);
      }, ANIM_MS);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [open, loadSlots]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = useCallback(async (slot: number) => {
    setBusy(slot);
    log.app(`[UI] Save to slot ${slot}`);
    await saveState(slot);
    await loadSlots();
    setBusy(null);
    onClose();
  }, [loadSlots, onClose]);

  const handleLoad = useCallback(async (slot: number) => {
    setBusy(slot);
    log.app(`[UI] Load from slot ${slot}`);
    await loadState(slot);
    setBusy(null);
    onClose();
  }, [onClose]);

  if (!visible) return null;

  const panelClass = `save-overlay ${animating === 'in' ? 'save-overlay--enter' : ''} ${animating === 'out' ? 'save-overlay--exit' : ''}`;

  return (
    <div className="save-overlay-backdrop" onClick={onClose}>
      <div className={panelClass} onClick={(e) => e.stopPropagation()}>
        {Array.from({ length: SLOT_COUNT }, (_, i) => {
          const slot = slots.find((s) => s.slot === i);
          const isEmpty = !slot || slot.timestamp === 0;
          const isBusy = busy === i;

          return (
            <SaveSlot
              key={i}
              slot={i}
              screenshotUrl={slot?.screenshotUrl ?? null}
              timestamp={slot?.timestamp ?? 0}
              isEmpty={isEmpty}
              busy={isBusy}
              shortcutKey={SHORTCUT_KEYS[i]}
              highlighted={highlightedSlot === i}
              holdProgress={highlightedSlot === i ? holdProgress : undefined}
              onSave={handleSave}
              onLoad={handleLoad}
            />
          );
        })}
      </div>
      {statusMessage && (
        <div className="save-overlay__status">{statusMessage}</div>
      )}
    </div>
  );
}
