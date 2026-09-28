/* @layer renderer-components @kind hook */
/**
 * Ctrl+V for a drop zone, which is not a text field and so never holds focus. While the
 * pointer is over the zone, a paste anywhere on the page hands the clipboard's files to
 * `onFiles`. A paste of text only is left alone, so text fields keep working.
 */
import { useCallback, useEffect, useState } from 'react';

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

  return { hovered, onPointerEnter, onPointerLeave };
};

export { usePasteFiles };
