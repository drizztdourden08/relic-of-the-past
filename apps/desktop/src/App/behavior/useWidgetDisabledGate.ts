/* @layer renderer-appshell @kind hook */
import { useCallback } from 'react';
import { useSearchStore, openSettingsTarget } from '@app/stores/search-store';
import type { PageId } from '../App.type';
import type { RotpWidgetDefinition } from '../widgets/rotp-widget-definition.type';
import { resolveWidgetDisabledState } from '../widgets/resolve-widget-disabled-state';

const useWidgetDisabledGate = (setActivePage: (page: PageId) => void) => {
  const vanillaSafe = useSearchStore((s) => s.settings?.vanillaSafe ?? false);
  const settings = useSearchStore((s) => s.settings);

  const resolveDisabled = useCallback(
    (definition: RotpWidgetDefinition) => resolveWidgetDisabledState(definition, vanillaSafe, settings),
    [vanillaSafe, settings],
  );

  const onOpenSettings = useCallback((settingId: string) => {
    setActivePage('profile');
    openSettingsTarget(settingId);
  }, [setActivePage]);

  return { resolveDisabled, onOpenSettings };
};

export { useWidgetDisabledGate };
