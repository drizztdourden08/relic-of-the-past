/* @layer renderer-components @kind hook */
/**
 * THE OUTLINE'S KEYBOARD PATH. Four shortcuts on a focused row, and the one
 * sentence they say out loud.
 *
 * WHY THE MODIFIER IS `isPrimaryModifier` AND NOT LITERALLY `Ctrl`. The plan
 * writes the shortcut as Ctrl+arrow, and every outline editor it borrows the
 * vocabulary from means the platform's own command key by that. §43.6 already
 * built the predicate the rest of this editor's drag reads per frame (`metaKey`
 * alone on macOS/iOS, `ctrlKey` alone elsewhere, either where the host cannot
 * say), and one editor answering two different questions about "the modifier"
 * is the drift that helper exists to stop.
 *
 * THE KEYS ARE FREE, AND WERE CHECKED, NOT ASSUMED. The global map binds
 * Alt+Enter, Ctrl+Shift+D, the primary modifier with K, and `Escape`
 * (`useKeyboardShortcuts.ts`); the search palette owns bare arrows and Enter but
 * only while it holds focus; `KeyRail` owns bare Left/Right on a keyframe
 * diamond. No modified arrow is taken anywhere. Shift and Alt are excluded here
 * on purpose, so a Ctrl+Shift+Arrow text selection is never swallowed by a row
 * that happened to have focus.
 *
 * IT IS BOUND ON THE ROW, NOT ON `document`. §33's whole argument is that two
 * listeners on one node cannot be ordered; a React handler on the focused row is
 * not a second global listener at all, so there is nothing to arbitrate. A
 * dialog or the palette takes focus and these stop existing.
 *
 * A MOVE THAT ONLY EXISTS AS A REPAINT IS NOT ACCESSIBLE EVEN WHEN THE KEY
 * WORKS. One `aria-live` region, written here and by nothing else, reading
 * `announcementFor`, which is the ghost's own lines 1-2 flattened. That is also the
 * check the ghost was designed to pass: if the card's content does not make a
 * sentence, the card is decorative.
 *
 * NOWHERE TO GO IS NOT A REFUSAL. Already first, already last, no previous
 * sibling: `stepIntent` answers `null` and the row shakes 2 px instead of
 * saying anything, because "you are at the top of a list" is something the list
 * already shows. A refusal (a target that exists and is illegal) is a sentence
 * and is announced.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlatform } from '@app/platform';
import { isPrimaryModifier } from '@shared/platform';
import { STEP_KEYS, stepIntent } from './step-intent';
import { announcementFor, ghostFor } from './drop-ghost';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { DropIntent } from './drop-intent';
import type { StepDirection } from './step-intent';
import type { HudLayout } from '@shared/types/hud';

/** Long enough to see, short enough that a held key still repeats usefully. */
const SHAKE_MS = 320;

interface OutlineKeysInput {
  doc: HudLayout;
  onDrop: (ids: readonly string[], intent: DropIntent) => void;
}

interface OutlineKeys {
  /** The `aria-live` region's whole content. Empty until something moves. */
  message: string;
  /** The row whose move had nowhere to go, for the 2 px shake. */
  shaking: string | null;
  /** Runs one of the four operations. The shortcut and the menu share it. */
  step: (id: string, direction: StepDirection) => void;
  onRowKeyDown: (id: string, event: ReactKeyboardEvent) => void;
}

const useOutlineKeys = (input: OutlineKeysInput): OutlineKeys => {
  const { doc, onDrop } = input;
  const os = usePlatform().info.os;
  const [message, setMessage] = useState('');
  const [shaking, setShaking] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const api = useRef({ doc, onDrop });
  api.current = { doc, onDrop };

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const step = useCallback((id: string, direction: StepDirection) => {
    const current = api.current.doc;
    const intent = stepIntent(current, id, direction);
    if (!intent) {
      if (timer.current) clearTimeout(timer.current);
      setShaking(id);
      timer.current = setTimeout(() => setShaking(null), SHAKE_MS);
      return;
    }
    // The announcement is composed from the GHOST's model, never from a second
    // set of strings. That shared phrasing is why `drop-ghost.ts` is pure.
    setMessage(announcementFor(ghostFor(current, [id], intent)));
    if (intent.kind !== 'refused') api.current.onDrop([id], intent);
  }, []);

  const onRowKeyDown = useCallback((id: string, event: ReactKeyboardEvent) => {
    if (event.altKey || event.shiftKey || !isPrimaryModifier(event, os)) return;
    const direction = STEP_KEYS[event.key];
    if (!direction) return;
    event.preventDefault();
    event.stopPropagation();
    step(id, direction);
  }, [os, step]);

  return { message, shaking, step, onRowKeyDown };
};

export { SHAKE_MS, useOutlineKeys };
export type { OutlineKeys, OutlineKeysInput };
