/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import type { HudLayout } from '@rotp/hud';
import { listLayouts } from '@app/hud/layout-document-io';

const useHudLayouts = (): readonly HudLayout[] => {
  const [layouts, setLayouts] = useState<readonly HudLayout[]>([]);

  useEffect(() => {
    let cancelled = false;
    void listLayouts().then((all) => { if (!cancelled) setLayouts(all); });
    return () => { cancelled = true; };
  }, []);

  return layouts;
};

export { useHudLayouts };
