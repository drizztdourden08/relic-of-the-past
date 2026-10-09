/* @layer renderer-appshell @kind hook */
import { useEffect } from 'react';
import { flushWidgetBlob, loadWidgetBlob } from '@app/lib/storage/widget-state';
import { readWidgetUi } from '@app/lib/storage/widget-prefs';
import { useWidgetUiStore } from '@app/stores/widget-ui-store';

const useWidgetPrefs = (profileId: string | null): void => {
  const hydrate = useWidgetUiStore((s) => s.hydrate);

  useEffect(() => {
    if (!profileId) return;
    let cancelled = false;
    void loadWidgetBlob(profileId).then((blob) => {
      if (!cancelled) hydrate(profileId, readWidgetUi(blob).byWidget);
    });
    return () => { cancelled = true; };
  }, [profileId, hydrate]);

  useEffect(() => {
    const onHide = () => { void flushWidgetBlob(); };
    window.addEventListener('pagehide', onHide);
    window.addEventListener('beforeunload', onHide);
    return () => {
      window.removeEventListener('pagehide', onHide);
      window.removeEventListener('beforeunload', onHide);
    };
  }, []);
};

export { useWidgetPrefs };
