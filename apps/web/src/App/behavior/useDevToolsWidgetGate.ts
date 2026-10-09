/* @layer renderer-appshell @kind hook */
import { useEffect } from 'react';
import { getDevOnlyWidgetIds, isWidgetOpen } from '@drizztdourden08/tessera/composites';
import type { WidgetLayout } from '@drizztdourden08/tessera/composites';
import { useSearchStore } from '@app/stores/search-store';
import { WIDGET_DEFINITIONS } from '../widgets/widget-definitions.constants';

const useDevToolsWidgetGate = (layout: WidgetLayout, close: (id: string) => void, forcedIds: string[] = []): boolean => {
  const developerToolsEnabled = useSearchStore((s) => s.settings?.developerToolsEnabled ?? false);

  useEffect(() => {
    if (developerToolsEnabled) return;
    for (const id of getDevOnlyWidgetIds(WIDGET_DEFINITIONS)) {
      if (isWidgetOpen(layout, id) && !forcedIds.includes(id)) close(id);
    }
  }, [developerToolsEnabled, layout, close, forcedIds]);

  return developerToolsEnabled;
};

export { useDevToolsWidgetGate };
