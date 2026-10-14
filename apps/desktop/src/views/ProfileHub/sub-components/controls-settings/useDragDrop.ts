/* @layer renderer-components @kind hook */
import { useState, useCallback } from 'react';
import { buildPresetProfile } from './build-preset-profile';
import { DRAG_SDL_TYPE } from './controls-settings.constants';
import { readDroppedPreset } from './read-dropped-preset';
import type { PendingPreset, UseDragDropArgs } from './controls-settings.type';

const useDragDrop = ({ devices, entries, scheme, activeProfile, updateActiveProfile }: UseDragDropArgs) => {
  const [dragOverBindings, setDragOverBindings] = useState(false);
  const [confirmPreset, setConfirmPreset] = useState<PendingPreset | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes(DRAG_SDL_TYPE)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      setDragOverBindings(true);
    }
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverBindings(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOverBindings(false);
    const dropped = readDroppedPreset({ transfer: e.dataTransfer, devices });
    if (dropped) setConfirmPreset(dropped);
  }, [devices]);

  const handleApplyPreset = useCallback(() => {
    if (!confirmPreset || !activeProfile) return;
    updateActiveProfile(buildPresetProfile({ preset: confirmPreset, profile: activeProfile, scheme, entries }));
    setConfirmPreset(null);
  }, [confirmPreset, activeProfile, updateActiveProfile, scheme, entries]);

  return {
    dragOverBindings,
    confirmPreset,
    setConfirmPreset,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleApplyPreset,
  };
};

export { useDragDrop };
