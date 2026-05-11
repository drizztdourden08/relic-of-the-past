import { useState, useEffect, useCallback, useRef } from 'react';
import { saveState, loadState, getActiveProfileId } from '../../../lib/game';
import { log } from '../../../lib/log-bus';
import './SaveStateOverlay.css';

const SLOT_COUNT = 4;
const SHORTCUT_KEYS = ['F1', 'F2', 'F3', 'F4'];
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
}

export function SaveStateOverlay({ open, onClose }: SaveStateOverlayProps): JSX.Element | null {
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
            <div key={i} className={`save-slot ${isBusy ? 'save-slot--busy' : ''}`}>
              <div className="save-slot__card">
                {slot?.screenshotUrl ? (
                  <img src={slot.screenshotUrl} alt={`Slot ${i + 1}`} className="save-slot__img" />
                ) : (
                  <div className="save-slot__empty" />
                )}
                <span className="save-slot__num">{i + 1}</span>
                <span className="save-slot__key">{SHORTCUT_KEYS[i]}</span>
                <div className="save-slot__btns">
                  <button
                    className="save-slot__btn save-slot__btn--save"
                    onClick={() => handleSave(i)}
                    disabled={isBusy}
                    title={`Save (Shift+${SHORTCUT_KEYS[i]})`}
                    aria-label={`Save slot ${i + 1}`}
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4.414A1 1 0 0 0 14.707 4L12 1.293A1 1 0 0 0 11.293 1H2zm0 1h1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V2.414L14 5.414V14H2V2zm3 0v3h4V2H5z" />
                    </svg>
                  </button>
                  <button
                    className="save-slot__btn save-slot__btn--load"
                    onClick={() => handleLoad(i)}
                    disabled={isEmpty || isBusy}
                    title={`Load (${SHORTCUT_KEYS[i]})`}
                    aria-label={`Load slot ${i + 1}`}
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                      <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                    </svg>
                  </button>
                </div>
              </div>
              {!isEmpty && slot && (
                <span className="save-slot__time">
                  {new Date(slot.timestamp).toLocaleString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
