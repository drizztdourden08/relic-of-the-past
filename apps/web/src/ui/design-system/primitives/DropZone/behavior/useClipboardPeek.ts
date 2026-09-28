/* @layer renderer-components @kind hook */
/**
 * While the pointer is over a drop zone, a look at the clipboard: true when it holds
 * something the zone takes, so the zone can say it is ready to paste. Browsers expose the
 * clipboard's types only for content such as a copied picture, never for files copied from
 * the file manager; those still paste, they just cannot be seen ahead of time. The first look
 * may ask the viewer for clipboard access; after a refusal the zone shows no notice.
 */
import { useEffect, useState } from 'react';

const clipboardTypes = async (): Promise<string[]> => {
  if (!navigator.clipboard?.read) return [];
  const state = await navigator.permissions?.query({ name: 'clipboard-read' as PermissionName }).then((p) => p.state).catch(() => 'prompt');
  if (state === 'denied') return [];
  const items = await navigator.clipboard.read();
  return items.flatMap((item) => [...item.types]);
};

const useClipboardPeek = (active: boolean, takesType: (type: string) => boolean): boolean => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active) {
      setReady(false);
      return undefined;
    }
    let live = true;
    clipboardTypes()
      .then((types) => { if (live) setReady(types.some(takesType)); })
      .catch(() => { if (live) setReady(false); });
    return () => { live = false; };
  }, [active, takesType]);

  return ready;
};

export { useClipboardPeek };
