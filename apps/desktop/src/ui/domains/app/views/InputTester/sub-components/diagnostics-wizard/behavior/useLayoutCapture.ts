/* @layer renderer-components @kind hook */
import { useCallback, useState } from 'react';
import { resolveDeviceFromEntry } from '@app/lib/input/resolve-device';
import { releaseHold } from './release-hold';
import { restoreHold } from './restore-hold';
import type { CapturedLayout, LayoutStage } from '../diagnostics-wizard.type';
import { awaitClaimedEntry } from './await-claimed-entry';

const useLayoutCapture = () => {
  const [stage, setStage] = useState<LayoutStage>('idle');
  const [layout, setLayout] = useState<CapturedLayout | null>(null);

  const capture = useCallback(async (deviceKey: string): Promise<CapturedLayout | null> => {
    setStage('starting');
    try {
      await restoreHold();
      setStage('fetching');
      const entry = await awaitClaimedEntry(deviceKey);
      setStage('stopping');
      await releaseHold();
      if (!entry) { setStage('error'); return null; }
      const captured: CapturedLayout = { deviceKey, entry, resolved: resolveDeviceFromEntry(entry) };
      setLayout(captured);
      setStage('done');
      return captured;
    } catch {
      await releaseHold().catch(() => undefined);
      setStage('error');
      return null;
    }
  }, []);

  const reset = useCallback(() => { setStage('idle'); setLayout(null); }, []);

  return { stage, layout, capture, reset };
};

export { useLayoutCapture };
export type { CapturedLayout, LayoutStage };
