/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { InputProfile } from '@rotp/input-mapping';
import type { UseProfileEditingArgs } from './controls.type';

const useProfileEditing = ({ profiles, initialEditId, onRename }: UseProfileEditingArgs) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const consumedInitialRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editingId) return;

    let frame = 0;
    let attempts = 0;
    const deadline = performance.now() + 3000;
    const focusWhenReady = () => {
      const input = inputRef.current;
      if (input && input.isConnected && !input.closest('[inert], [aria-hidden="true"]') &&
          input.getClientRects().length > 0 && getComputedStyle(input).visibility === 'visible') {
        input.focus();
        if (document.activeElement === input) {
          input.select();
          return;
        }
      }
      if (++attempts < 180 && performance.now() < deadline) {
        frame = requestAnimationFrame(focusWhenReady);
      }
    };
    focusWhenReady();
    return () => cancelAnimationFrame(frame);
  }, [editingId]);

  const startEditing = useCallback((profile: InputProfile) => {
    setEditingId(profile.id);
    setEditValue(profile.name);
  }, []);

  useEffect(() => {
    if (initialEditId && initialEditId !== consumedInitialRef.current) {
      consumedInitialRef.current = initialEditId;
      const profile = profiles.find(p => p.id === initialEditId);
      if (profile) startEditing(profile);
    }
  }, [initialEditId, profiles]);

  const commitEdit = useCallback((profile: InputProfile) => {
    if (editValue.trim()) {
      onRename(profile, editValue);
    }
    setEditingId(null);
  }, [editValue, onRename]);

  const cancelEdit = useCallback(() => setEditingId(null), []);

  return { editingId, editValue, inputRef, setEditValue, startEditing, commitEdit, cancelEdit };
};

export { useProfileEditing };
