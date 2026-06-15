/* @layer renderer-components @kind component */
import { useState, useEffect, useCallback, useRef } from 'react';
import { saveState, loadState, getActiveProfileId } from '../../../../../lib/game';
import { SaveSlot } from '../../compounds/SaveSlot';
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import { Image } from '../../../../design-system/primitives/Image';
import { ProgressRing } from '../../../../design-system/primitives/ProgressRing';
import { log } from '../../../../../lib/log-bus';
import * as savesStore from '@app/lib/storage/saves-store';
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
  const trackRef = useRef<HTMLDivElement | null>(null);
  const highlightedRef = useRef<HTMLDivElement | null>(null);

  const loadSlots = useCallback(async () => {
    const profileId = getActiveProfileId();
    if (!profileId) return;

    const infos = await savesStore.getSlotInfos(profileId);

    const slotData: SlotInfo[] = [];
    for (let i = 0; i < SLOT_COUNT; i++) {
      const info = infos.find((s) => s.slot === i);
      let screenshotUrl: string | null = null;
      if (info?.hasScreenshot) {
        try {
          const b64 = await savesStore.readScreenshot(profileId, i);
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

  // Map vertical wheel to horizontal scroll so a scroll wheel pages through slots
  // (the track overflows horizontally on small viewports). Native non-passive
  // listener so preventDefault actually takes.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [visible]);

  // Center the highlighted slot (the one whose shortcut was hit) in the track,
  // scrolling only as far as needed. Manual calc rather than scrollIntoView so it
  // never nudges the page vertically and always centers within the track.
  useEffect(() => {
    const track = trackRef.current;
    const el = highlightedRef.current;
    if (!track || !el) return;
    const trackRect = track.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const delta = (elRect.left + elRect.width / 2) - (trackRect.left + trackRect.width / 2);
    track.scrollTo({ left: track.scrollLeft + delta, behavior: 'smooth' });
  }, [highlightedSlot, visible]);

  // Stay open after saving so the freshly-captured thumbnail updates in place
  // immediately (loading dismisses instead — you're resuming the game).
  const handleSave = useCallback(async (slot: number) => {
    setBusy(slot);
    log.app(`[UI] Save to slot ${slot}`);
    await saveState(slot);
    await loadSlots();
    setBusy(null);
  }, [loadSlots]);

  const handleLoad = useCallback(async (slot: number) => {
    setBusy(slot);
    log.app(`[UI] Load from slot ${slot}`);
    await loadState(slot);
    setBusy(null);
    onClose();
  }, [onClose]);

  if (!visible) return null;

  const panelClass = `save-overlay ${animating === 'in' ? 'save-overlay--enter' : ''} ${animating === 'out' ? 'save-overlay--exit' : ''}`;

  const showHints = highlightedSlot != null && hints != null && hints.length > 0;

  return (
    <Box className="save-overlay-backdrop" onClick={onClose}>
      <Box className={panelClass} onClick={(e) => e.stopPropagation()}>
        <Box ref={trackRef} className="save-overlay__track">
          {Array.from({ length: SLOT_COUNT }, (_, i) => {
            const slot = slots.find((s) => s.slot === i);
            const isEmpty = !slot || slot.timestamp === 0;
            const isBusy = busy === i;
            const isHighlighted = highlightedSlot === i;

            return (
              <Box
                key={i}
                className="save-overlay__slot-wrapper"
                ref={isHighlighted ? highlightedRef : undefined}
              >
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
              </Box>
            );
          })}
        </Box>

        {showHints && (
          <Box className="save-overlay__hints">
            {hints?.map((hint) => (
              <Box key={hint.action} className={`save-overlay__hint save-overlay__hint--${hint.action}`}>
                <Box className="save-overlay__hint-icon-wrap">
                  {hint.iconUrl ? (
                    <Image src={hint.iconUrl} alt={hint.keyLabel} className="save-overlay__hint-icon" />
                  ) : (
                    <Text className="save-overlay__hint-key-text">{hint.keyLabel}</Text>
                  )}
                  {(hint.action === 'hold-save' || hint.action === 'holding-save') && (
                    <ProgressRing
                      className="save-overlay__hint-ring"
                      progress={hint.action === 'holding-save' ? (holdProgress ?? 0) : undefined}
                    />
                  )}
                </Box>
                <Text className="save-overlay__hint-label">
                  {hint.action === 'tap-load' && 'Tap to load'}
                  {hint.action === 'hold-save' && 'Hold to save'}
                  {hint.action === 'holding-save' && 'Saving…'}
                  {hint.action === 'esc-cancel' && 'Cancel'}
                </Text>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export { SaveStateOverlay };
