/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_LAYOUT } from '@rotp/hud';
import { listLayouts } from '@app/hud/layout-document-io';
import type { HudLayout } from '@rotp/hud';
import type { SchemeLayout, UseSchemeLayoutArgs } from './controls-settings.type';

const useSchemeLayout = (args: UseSchemeLayoutArgs): SchemeLayout => {
  const { activeProfile, updateActiveProfile } = args;
  const [layouts, setLayouts] = useState<readonly HudLayout[]>([]);

  useEffect(() => {
    let cancelled = false;
    void listLayouts().then((all) => { if (!cancelled) setLayouts(all); });
    return () => { cancelled = true; };
  }, []);

  const layoutId = activeProfile?.modern?.layoutId ?? DEFAULT_LAYOUT.id;

  const setLayoutId = useCallback((next: string) => {
    const modern = activeProfile?.modern;
    if (!activeProfile || !modern) return;
    updateActiveProfile({ ...activeProfile, modern: { ...modern, layoutId: next }, modifiedAt: Date.now() });
  }, [activeProfile, updateActiveProfile]);

  return { layoutId, layouts, setLayoutId };
};

export { useSchemeLayout };
