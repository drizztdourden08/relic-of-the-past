/* @layer renderer-appshell @kind hook */
import { appApi } from '@app/ipc/app-api';
import { useEffect, useRef } from 'react';
import { loadStateRef } from '@app/game';
import type { DumpNavDeps } from './useDumpNav.type';
import { DUMP_SETTLE_MS } from './nav-dump.constants';
import { EXIT_DELAY_MS } from './auto-launch.constants';
import { waitForGameRunning } from './wait-for-game-running';
import { collectNavDump } from './collect-nav-dump';

const useDumpNav = ({ activeProfile, loadProfileForGame }: DumpNavDeps) => {
  const didRun = useRef(false);

  useEffect(() => {
    if (!activeProfile || didRun.current) return;
    let cancelled = false;

    (async () => {
      const slot = await appApi().getDumpNavSlot();
      if (slot === null) return;
      didRun.current = true;

      console.log(`[DumpNav] Starting game for profile: ${activeProfile.name}`);
      await loadProfileForGame(activeProfile);

      await waitForGameRunning(() => cancelled);
      if (cancelled) return;

      const kind = typeof slot === 'number' ? 'quick slot' : 'manual save';
      console.log(`[DumpNav] Game running. Loading ${kind} ${slot}...`);
      const loadResult = await loadStateRef(slot);
      console.log(`[DumpNav] load ${kind} ${slot} returned: ${loadResult}`);
      if (!loadResult) {
        const dump = { slot, error: `loading ${kind} "${slot}" returned false. The state was not found, or the module is not ready.` };
        await appApi().writeDumpNav(dump);
        setTimeout(() => window.close(), EXIT_DELAY_MS);
        return;
      }
      await new Promise((r) => setTimeout(r, DUMP_SETTLE_MS));
      if (cancelled) return;

      const dump = collectNavDump(slot);

      console.log(`[DumpNav] Dumping navigation data...`);
      console.log(JSON.stringify(dump, null, 2));
      const path = await appApi().writeDumpNav(dump);
      console.log(`[DumpNav] Written to: ${path}`);

      setTimeout(() => window.close(), EXIT_DELAY_MS);
    })();

    return () => { cancelled = true; };
  }, [activeProfile]);
};

export { useDumpNav };
