/* @layer renderer-appshell @kind hook */
/**
 * Disabled-state wiring for widgets: reads the live settings snapshot (registered onto
 * useSearchStore by ProfileHub while it's mounted, same as useDevToolsWidgetGate) and builds
 * the callback WidgetManager's overlay uses to open Settings at whichever setting caused a
 * widget to be covered, either Vanilla Safe's readsGameData lock or a widget's own
 * requiresSetting gate (Widget.type.ts). Unlike a settings-page control, a widget can
 * be open while the profile page isn't showing, so this switches the app there first.
 */
import { useCallback } from 'react';
import { useSearchStore, openSettingsTarget } from '@app/stores/search-store';
import type { PageId } from '@app/App/types';

const useWidgetDisabledGate = (setActivePage: (page: PageId) => void) => {
  const vanillaSafe = useSearchStore((s) => s.settings?.vanillaSafe ?? false);
  const settings = useSearchStore((s) => s.settings);

  const onOpenSettings = useCallback((settingId: string) => {
    setActivePage('profile');
    openSettingsTarget(settingId);
  }, [setActivePage]);

  return { vanillaSafe, settings, onOpenSettings };
};

export { useWidgetDisabledGate };
