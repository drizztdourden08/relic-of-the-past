/* @layer renderer-components @kind component */
import { useState, useEffect, useCallback, useRef } from 'react';
import { saveState, loadState, getActiveProfileId } from '../../../../../lib/game';
import { SaveSlot } from '../../compounds/SaveSlot';
import { log } from '../../../../../lib/log-bus';
import type { SlotHint } from './behavior/useEnhancedSaveSlot';
import './SaveStateOverlay.css';
import type { SaveStateOverlayProps, SlotInfo } from './SaveStateOverlay.type';
import { SLOT_COUNT, SHORTCUT_KEYS, ANIM_MS } from './SaveStateOverlay.constants';


const SaveStateOverlay = (props: SaveStateOverlayProps) => {
  const { open, onClose, highlightedSlot, holdProgress, hints } = props;
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [busy, setBusy] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState<'in' | 'out' | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
  }, [open, loadSlots]);

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
          const isHighlighted = highlightedSlot === i;

          return (
            <div key={i} className="save-overlay__slot-wrapper">
              <SaveSlot
                slot={i}
                screenshotUrl={slot?.screenshotUrl ?? null}
                timestamp={slot?.timestamp ?? 0}
                isEmpty={isEmpty}
                busy={isBusy}
                shortcutKey={SHORTCUT_KEYS[i]}
                highlighted={isHighlighted}
                holdProgress={isHighlighted ? holdProgress : undefined}
                onSave={handleSave}
                onLoad={handleLoad}
              />
              {isHighlighted && hints && hints.length > 0 && (
                <div className="save-overlay__hints">
                  {hints.map((hint) => (
                    <div key={hint.action} className={`save-overlay__hint save-overlay__hint--${hint.action}`}>
                      <span className="save-overlay__hint-icon-wrap">
                        {hint.iconUrl ? (
                          <img src={hint.iconUrl} alt={hint.keyLabel} className="save-overlay__hint-icon" />
                        ) : (
                          <span className="save-overlay__hint-key-text">{hint.keyLabel}</span>
                        )}
                        {(hint.action === 'hold-save' || hint.action === 'holding-save') && (
                          <svg className="save-overlay__hint-ring" viewBox="0 0 36 36">
                            <circle
                              className="save-overlay__hint-ring-bg"
                              cx="18" cy="18" r="15"
                              fill="none"
                              strokeWidth="2.5"
                            />
                            {hint.action === 'holding-save' && (
                              <circle
                                className="save-overlay__hint-ring-progress"
                                cx="18" cy="18" r="15"
                                fill="none"
                                strokeWidth="2.5"
                                strokeDasharray={`${15 * 2 * Math.PI}`}
                                strokeDashoffset={`${15 * 2 * Math.PI * (1 - (holdProgress ?? 0))}`}
                              />
                            )}
                          </svg>
                        )}
                      </span>
                      <span className="save-overlay__hint-label">
                        {hint.action === 'tap-load' && 'Tap to load'}
                        {hint.action === 'hold-save' && 'Hold to save'}
                        {hint.action === 'holding-save' && 'Saving…'}
                        {hint.action === 'esc-cancel' && 'Cancel'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { SaveStateOverlay };
