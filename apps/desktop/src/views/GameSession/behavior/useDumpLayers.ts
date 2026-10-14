/* @layer renderer-appshell @kind hook */
import { requireHostApi } from '@drizztdourden08/brock-react';
import { useEffect, useRef } from 'react';
import type { DumpLayersDeps } from './useDumpLayers.type';
import { runDumpLayers } from './run-dump-layers';

const useDumpLayers = ({ activeProfile, loadProfileForGame, openNavWidget }: DumpLayersDeps) => {
  const didRun = useRef(false);

  useEffect(() => {
    if (!activeProfile || didRun.current) return;

    const abort = new AbortController();

    void (async () => {
      const slot = await requireHostApi().getDumpLayersSlot();
      const hoverTile = await requireHostApi().getHoverTile();
      console.log(`[DumpLayers] hook fired. slot=${slot}, hoverTile=${JSON.stringify(hoverTile)}, profile=${activeProfile.name}`);
      if (slot === null) return;

      didRun.current = true;
      await runDumpLayers({ activeProfile, loadProfileForGame, openNavWidget, slot, hoverTile, isCancelled: () => abort.signal.aborted });
    })();

    return () => abort.abort();
  }, [activeProfile]);
};

export { useDumpLayers };
