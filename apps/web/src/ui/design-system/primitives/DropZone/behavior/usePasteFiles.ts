/* @layer renderer-components @kind hook */
/**
 * Paste for a drop zone, which is not a text field and so never holds focus. While the
 * pointer is over the zone, a paste anywhere on the page hands the clipboard's files to
 * `onFiles`: hover and press Ctrl+V. The zone also carries a transparent editable layer, so
 * a right-click offers the browser's own Paste; that layer never keeps what is pasted.
 */
import { useCallback, useEffect, useState } from 'react';
import type { ClipboardEvent as ReactClipboardEvent, FormEvent } from 'react';

const filesOf = (data: DataTransfer | null): File[] => Array.from(data?.files ?? []);

const usePasteFiles = (onFiles: (files: File[]) => void, enabled: boolean) => {
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!enabled || !hovered) return undefined;
    const handlePaste = (event: ClipboardEvent) => {
      const files = filesOf(event.clipboardData);
      if (files.length === 0) return;
      event.preventDefault();
      onFiles(files);
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [enabled, hovered, onFiles]);

  const onPointerEnter = useCallback(() => setHovered(true), []);
  const onPointerLeave = useCallback(() => setHovered(false), []);
  /** The editable layer takes no text: a paste of files reaches the window listener above. */
  const onLayerPaste = useCallback((event: ReactClipboardEvent<HTMLElement>) => event.preventDefault(), []);
  const onLayerInput = useCallback((event: FormEvent<HTMLElement>) => { event.currentTarget.textContent = ''; }, []);

  return { hovered, onPointerEnter, onPointerLeave, onLayerPaste, onLayerInput };
};

export { usePasteFiles };
