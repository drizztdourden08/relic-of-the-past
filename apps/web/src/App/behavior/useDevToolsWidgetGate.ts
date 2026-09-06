/* @layer renderer-appshell @kind hook */
/**
 * Master gate for developer-only UI: reads the live developerToolsEnabled setting
 * (registered onto useSearchStore by ProfileHub while it's mounted) and, the moment it goes
 * off, closes every `devOnly` widget (Widget.constants.ts).
 *
 * WidgetManager's render filter only *hides* a devOnly widget while the gate is off. It
 * never clears the widget's persisted `visible: true`, so a widget left open would silently
 * resurrect the next time dev tools are re-enabled. This also sweeps any devOnly widget
 * left visible by a profile saved before this gate existed.
 *
 * Startup-forced ids (the `--widgets=` flag) are exempt, matching WidgetManager's render
 * filter. Without that exemption the sweep undoes the flag a frame after it lands, which
 * took every CLI-driven baseline spec down with it.
 */
import { useEffect } from 'react';
import { getDevOnlyWidgetIds } from '@ds/composites/Widget';
import type { WidgetLayout } from '@ds/composites/Widget';
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
