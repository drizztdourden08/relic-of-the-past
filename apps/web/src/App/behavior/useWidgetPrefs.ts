/* @layer renderer-appshell @kind hook */
/**
 * Binds the widget-prefs store to the active profile: loads what that profile had
 * saved, and makes sure whatever is still pending reaches disk before the window
 * goes away.
 *
 * The flush covers the layout too, because both halves share one repository and
 * one debounced write.
 */
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
    // pagehide, not beforeunload alone: Electron tears the window down without
    // running a beforeunload handler that does not call preventDefault.
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
