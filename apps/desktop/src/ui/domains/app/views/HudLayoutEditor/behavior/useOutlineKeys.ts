/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePlatform } from '@drizztdourden08/brock-react';
import { isPrimaryModifier } from '@shared/platform/is-primary-modifier';
import { STEP_KEYS, stepIntent } from './step-intent';
import { announcementFor, ghostFor } from './drop-ghost';
import { SHAKE_MS } from './useOutlineKeys.constants';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { StepDirection } from './step-intent';
import type { OutlineKeys, OutlineKeysInput } from './useOutlineKeys.type';

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

export { useOutlineKeys };
export type { OutlineKeys, OutlineKeysInput } from './useOutlineKeys.type';
