/* @layer renderer-appshell @kind hook */
import { useEffect } from 'react';
import { getDevOnlyWidgetIds } from '@drizztdourden08/tessera/composites';
import type { WidgetLayout } from '@drizztdourden08/tessera/composites';
import { useSearchStore } from '@app/stores/search-store';

const useDevToolsWidgetGate = (layout: WidgetLayout, close: (id: string) => void, forcedIds: string[] = []): boolean => {
  const developerToolsEnabled = useSearchStore((s) => s.settings?.developerToolsEnabled ?? false);

  useEffect(() => {
    if (developerToolsEnabled) return;
    const devOnlyIds = new Set(getDevOnlyWidgetIds());
    for (const w of layout.widgets) {
      if (w.visible && devOnlyIds.has(w.id) && !forcedIds.includes(w.id)) close(w.id);
    }
  }, [developerToolsEnabled, layout, close, forcedIds]);

  return developerToolsEnabled;
};

export { useDevToolsWidgetGate };
