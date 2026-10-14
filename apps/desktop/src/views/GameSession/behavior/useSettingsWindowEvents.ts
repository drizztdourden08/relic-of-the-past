/* @layer renderer-appshell @kind hook */
import { useEffect } from 'react';
import { toast } from '@drizztdourden08/tessera/composites';
import { ENHANCED_FALLBACK_EVENT, ENHANCED_FALLBACK_MESSAGE, ENHANCED_FALLBACK_TOAST_ID } from '@rotp/game-core';
import type { AppSettings } from '@app/settings.type';
import type { AppSettingsStore } from './useSettingsBridge.type';

const useSettingsWindowEvents = (store: AppSettingsStore): void => {
  useEffect(() => {
    const onChange = (event: Event) => {
      const patch = (event as CustomEvent).detail as Partial<AppSettings> | undefined;
      if (patch) store.getState().patch(patch);
    };
    const onFallback = () => {
      store.getState().patch({ hudStyle: 'vanilla' });
      toast({ id: ENHANCED_FALLBACK_TOAST_ID, message: ENHANCED_FALLBACK_MESSAGE, variant: 'danger', duration: 0 });
    };
    window.addEventListener('settings:change', onChange);
    window.addEventListener(ENHANCED_FALLBACK_EVENT, onFallback);
    return () => {
      window.removeEventListener('settings:change', onChange);
      window.removeEventListener(ENHANCED_FALLBACK_EVENT, onFallback);
    };
  }, [store]);
};

export { useSettingsWindowEvents };
