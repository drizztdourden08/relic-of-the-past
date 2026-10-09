/* @layer renderer-appshell @kind hook */
import { useCallback } from 'react';
import { useSearchStore, openSettingsTarget } from '@app/stores/search-store';
import type { PageId } from '../App.type';

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
