/* @layer renderer-appshell @kind hook */
/**
 * Debug hook: reacts to the --sim-run CLI flag.
 *
 * Starts the game, optionally loads a save slot, force-enables auto-skip-dialog
 * and developer tools, drives the gameplay simulator headlessly to its stop
 * condition, writes a SimRunReport to debug-output/sim-run.json, then exits.
 * Powers the in-chat data-correction loop (run → read suggestions → apply → re-run).
 */

import { useEffect, useRef } from 'react';
import { subscribeGameState, loadState, loadStateRef, wasmGetViewportInfo, wasmGetSpriteCombat, wasmGetCombatTables } from '../../lib/game';
import { linkStartTile } from '@shared/game/navigation/link-start-tile';
import { createLiveGamePort, runSimulation, floodOverworldScreen, probeRoom, scanRoomsForSprite } from '@app/lib/game/simulator';
import { pauseSramSync, resumeSramSync } from '@app/lib/game/sram-sync';
import { overworldOrigin } from '@app/lib/game/flood';
import { buildSimRunReport, formatEndSummary } from '@shared/game/simulation';
import { getModule } from '../../lib/game';

/** Bit that excludes a sprite from a room-clear count, per Sprite_CheckIfRoomIsClear. */
const ROOM_CLEAR_EXEMPT_BIT = 0x40;

interface SimRunDeps {
  activeProfile: Profile | null;
  loadProfileForGame: (profile: Profile) => Promise<void>;
}

/** The features word the core has been ASKED for — it latches on the next frame.
 *  -1 means the module was not reachable, which is NOT the same as no features. */
const readWantedFeatures = (): number => {
  const mod = getModule();
  if (!mod) return -1;
  try { return Number(mod.ccall('WasmGetFeatures', 'number', [], [])); } catch { return -2; }
};

const waitForRunning = (): Promise<void> =>
  new Promise((resolve) => {
    const unsub = subscribeGameState((state) => {
      if (state.status === 'running') { unsub(); resolve(); }
    });
  });

const useSimRun = ({ activeProfile, loadProfileForGame }: SimRunDeps) => {
  const didRun = useRef(false);

  useEffect(() => {
    if (!activeProfile || didRun.current) return;

    (async () => {
      const config = await window.api.getSimRunConfig();
      if (config === null) return;
      didRun.current = true;

      console.log(`[SimRun] Starting game for profile: ${activeProfile.name}`);
      await loadProfileForGame(activeProfile);
      await waitForRunning();

      if (config.stateName !== null) {
        const ok = await loadStateRef(config.stateName);
        console.log(`[SimRun] loadStateRef(${config.stateName}) → ${ok}`);
        await new Promise((r) => setTimeout(r, 2000));
      } else if (config.startSlot !== null) {
        const loaded = await loadState(config.startSlot);
        console.log(`[SimRun] loadState(${config.startSlot}) → ${loaded}`);
        if (!loaded) {
          await window.api.writeSimRun({ error: `loadState(${config.startSlot}) failed`, config });
          setTimeout(() => window.close(), 500);
          return;
        }
      }
      await new Promise((r) => setTimeout(r, 3000));

      // Developer tools unlock the combat-table queries the diagnostics below and the
      // full simulation both rely on. The tables are the game's own read-only combat
      // data, the gate is a read-only instrumentation switch, and the sim run is itself
      // a developer tool — so it may switch the gate on for its own duration without
      // touching the user's persisted setting, and must switch it back off afterwards.
      const port = createLiveGamePort();
      pauseSramSync();
      port.setAutoSkipDialog(true);
      port.setDeveloperTools(true);
      // A features word set from here is only WANTED until the core latches it on its
      // next frame (zelda_rtl.c:989), so the queries the gate unlocks answer with
      // nothing if they run in the same tick. Give the core frames to pick it up.
      await new Promise((r) => setTimeout(r, 500));
      try {
        // Diagnostic: addressable flood of one screen — validates the sim's flood
        // matches the normal in-game flood without running the whole simulation.
        if (config.floodScreen !== null) {
          // Seed from the live player tile only when the game is actually standing on
          // the flooded overworld screen; otherwise flood seedless (remote screen).
          const vp = wasmGetViewportInfo();
          const liveScreen = vp ? ((((vp.linkY >> 9) & 7) << 3) | ((vp.linkX >> 9) & 7)) : -1;
          const startPos = config.probeTile ?? (vp && liveScreen === config.floodScreen
            ? linkStartTile({
                linkX: vp.linkX, linkY: vp.linkY,
                screenWorldX: overworldOrigin(config.floodScreen).x,
                screenWorldY: overworldOrigin(config.floodScreen).y,
              })
            : undefined);
          const items = ['lift.1', ...(config.probeItems ?? [])] as Parameters<typeof floodOverworldScreen>[2];
          const flood = floodOverworldScreen(config.floodScreen, startPos, items);
          console.log(`[SimRun] flood seed=${JSON.stringify(startPos)} liveScreen=0x${liveScreen.toString(16)}`);
          console.log(`[SimRun] flood screen 0x${config.floodScreen.toString(16)}: ${JSON.stringify(flood && { reachable: flood.reachableCount, total: flood.totalTiles, entrances: flood.entranceCount, edges: flood.edgeCount, ledges: flood.ledgeCount })}`);
          await window.api.writeSimRun({ floodScreen: config.floodScreen, items, flood });
          setTimeout(() => window.close(), 500);
          return;
        }

        // Diagnostic: which rooms hold a given sprite? A dataset room index that
        // points at the wrong cave is invisible until you ask the game itself.
        if (config.scanSprite !== null) {
          const hits = scanRoomsForSprite(config.scanSprite);
          console.log(`[SimRun] sprite 0x${config.scanSprite.toString(16)} in ${hits.length} rooms`);
          await window.api.writeSimRun({ scanSprite: config.scanSprite, hits });
          setTimeout(() => window.close(), 500);
          return;
        }

        // Diagnostic: why does one room read as a dead end? Dumps the tables that
        // decide it (entrance seeds, fall holes, exit-screen entry, detected exits).
        if (config.probeRoom !== null) {
          const probe = probeRoom(config.probeRoom, config.probeTile ?? undefined,
            ['lift.1', ...(config.probeItems ?? [])] as Parameters<typeof probeRoom>[2]);
          console.log(`[SimRun] room 0x${config.probeRoom.toString(16)}: ${JSON.stringify(probe)}`);
          await window.api.writeSimRun({ probe });
          setTimeout(() => window.close(), 500);
          return;
        }

        // Diagnostic: dump one sprite type's resolved combat row plus the shared
        // ancilla/tile combat tables. A `null` query result is flagged explicitly so
        // developer tools being off is never mistaken for a sprite that deals no damage.
        if (config.combatSprite !== null) {
          // The damage rows are unpacked from a compressed asset when a file is
          // loaded (select_file.c:228), so this reads all zeros unless the run also
          // loads a state — pair `combat=` with `slot=` or `state=`.
          const spriteCombat = wasmGetSpriteCombat(config.combatSprite);
          const tables = wasmGetCombatTables();
          const combat = {
            combatSprite: config.combatSprite,
            spriteQueryFailed: spriteCombat === null,
            tablesQueryFailed: tables === null,
            health: spriteCombat?.health ?? null,
            flags4: spriteCombat?.flags4 ?? null,
            countsTowardRoomClear: spriteCombat === null ? null : (spriteCombat.flags4 & ROOM_CLEAR_EXEMPT_BIT) === 0,
            damageByClass: spriteCombat?.damageByClass ?? null,
            nonZeroAncillaDamageClasses: tables?.ancillaDamageClass.filter((c) => c !== 0).length ?? null,
            projectileBlockingTiles: tables?.projectileTileCollision.filter((v) => v === 1).length ?? null,
            featuresWanted: readWantedFeatures(),
          };
          console.log(`[SimRun] combat sprite 0x${config.combatSprite.toString(16)}: ${JSON.stringify(combat)}`);
          await window.api.writeSimRun(combat);
          setTimeout(() => window.close(), 500);
          return;
        }

        const { state, recorder, steps, reachedTarget, screenFloods, visits, path, checks, tally, endSummary } = await runSimulation(port, config);
        const report = buildSimRunReport(state, recorder, { config, steps, reachedTarget });
        for (const line of formatEndSummary(endSummary)) console.log(`[SimRun] END ${line}`);
        console.log(`[SimRun] outcome=${report.outcome} reachedTarget=${reachedTarget} steps=${steps} checks=${report.verifiedChecks.length} floods=${screenFloods.length}`);
        const inventory = {
          items: [...state.inventory].sort(),
          keys: Object.fromEntries([...state.keys].filter(([, n]) => n > 0)),
          bigKeys: [...state.bigKeys].sort(),
          events: [...state.events].sort(),
        };
        const outPath = await window.api.writeSimRun({ ...report, screenFloods, visits, path, checks, inventory, tally, endSummary });
        console.log(`[SimRun] Written to: ${outPath}`);
      } finally {
        port.setAutoSkipDialog(null);
        port.setDeveloperTools(null);
        resumeSramSync();
      }

      setTimeout(() => window.close(), 500);
    })();
  }, [activeProfile]);
};

export { useSimRun };
