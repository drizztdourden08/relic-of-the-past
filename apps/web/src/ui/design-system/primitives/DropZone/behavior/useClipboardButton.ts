/* @layer renderer-components @kind hook */
/**
 * The drop zone's Paste button. While the pointer is over the zone, the clipboard is looked
 * at only when the viewer already allowed it, so hovering never raises the browser's
 * permission prompt: `ready` when it holds something the zone takes, `empty` when not.
 * Before any answer it is `unknown`, and a click asks once, then pastes. Browsers expose
 * copied content such as a picture, never files copied from the file manager, so those
 * leave the button empty; they still paste with Ctrl+V.
 */
import { useCallback, useEffect, useState } from 'react';

type ClipboardState = 'unknown' | 'ready' | 'empty';

const readAllowed = async (): Promise<PermissionState | 'unsupported'> => {
  if (!navigator.clipboard?.read) return 'unsupported';
  if (!navigator.permissions?.query) return 'prompt';
  return navigator.permissions.query({ name: 'clipboard-read' as PermissionName }).then((p) => p.state).catch(() => 'prompt' as const);
};

/** The clipboard's first item the zone takes, as a file, or null. */
const pasteable = async (takesType: (type: string) => boolean): Promise<File | null> => {
  for (const item of await navigator.clipboard.read()) {
    const type = item.types.find(takesType);
    if (type) return new File([await item.getType(type)], `pasted.${type.split('/')[1] ?? 'bin'}`, { type });
  }
  return null;
};

const useClipboardButton = (active: boolean, takesType: (type: string) => boolean, onFiles: (files: File[]) => void) => {
  const [state, setState] = useState<ClipboardState>('unknown');

  useEffect(() => {
    if (!active) return undefined;
    let live = true;
    const look = async () => {
      const allowed = await readAllowed();
      if (allowed === 'unsupported' || allowed === 'denied') return 'empty';
      if (allowed !== 'granted') return 'unknown';
      return (await pasteable(takesType)) ? 'ready' : 'empty';
    };
    look().then((next) => { if (live) setState(next); }).catch(() => { if (live) setState('empty'); });
    return () => { live = false; };
  }, [active, takesType]);

  const paste = useCallback(async () => {
    try {
      const file = await pasteable(takesType);
      setState(file ? 'ready' : 'empty');
      if (file) onFiles([file]);
    } catch {
      setState('empty');
    }
  }, [takesType, onFiles]);

  return { state, paste };
};

export { useClipboardButton };
export type { ClipboardState };
