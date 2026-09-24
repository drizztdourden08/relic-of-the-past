/* @layer renderer-appshell @kind hook */
/**
 * Master gate for developer-only UI: reads the live developerToolsEnabled setting
 * (registered onto useSearchStore by ProfileHub while it's mounted) and, the moment it goes
 * off, closes every `devOnly` widget (Widget.constants.ts).
 *
 * The dock's render filter only *hides* a devOnly widget while the gate is off. It never
 * takes the widget out of the persisted layout, so a widget left open would silently
 * resurrect the next time dev tools are re-enabled. This also sweeps any devOnly widget
 * left open by a profile saved before this gate existed.
 *
 * Startup-forced ids (the `--widgets=` flag) are exempt, matching the render filter.
 * Without that exemption the sweep undoes the flag a frame after it lands, which took
 * every CLI-driven baseline spec down with it.
 */
import { useEffect } from 'react';
import { getDevOnlyWidgetIds } from '@ds/composites/Widget';
import { useSearchStore } from '@app/stores/search-store';
import { isWidgetOpen } from '@app/stores/widget-layout-edits';
import { useWidgetLayoutStore } from '@app/stores/widget-layout-store';

const useDevToolsWidgetGate = (forcedIds: string[] = []): boolean => {
  const developerToolsEnabled = useSearchStore((s) => s.settings?.developerToolsEnabled ?? false);
  const layout = useWidgetLayoutStore((s) => s.layout);
  const close = useWidgetLayoutStore((s) => s.close);

  useEffect(() => {
    if (developerToolsEnabled) return;
    for (const id of getDevOnlyWidgetIds()) {
      if (isWidgetOpen(layout, id) && !forcedIds.includes(id)) close(id);
    }
  }, [developerToolsEnabled, layout, close, forcedIds]);

  return developerToolsEnabled;
};

export { useDevToolsWidgetGate };
