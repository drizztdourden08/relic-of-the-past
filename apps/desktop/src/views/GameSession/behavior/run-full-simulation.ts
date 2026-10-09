/* @layer renderer-appshell @kind logic */
import { appApi } from '@app/ipc/app-api';
import type { SimRunConfig, SimulatorPort } from '@shared/game/simulation';
import { buildSimRunReport, formatEndSummary } from '@shared/game/simulation';
import { getDungeon, getItem } from '@shared/game/data';
import { runSimulation } from '@app/lib/game/simulator';
import { readLoadout } from '@app/lib/game/simulator/read-loadout';

const runFullSimulation = async (port: SimulatorPort, config: SimRunConfig): Promise<void> => {
  const { state, recorder, steps, reachedTarget, screenFloods, visits, path, checks, log, tally, endSummary } = await runSimulation(port, config);
  const report = buildSimRunReport(state, recorder, { config, steps, reachedTarget });
  for (const line of formatEndSummary(endSummary)) console.log(`[SimRun] END ${line}`);
  console.log(`[SimRun] outcome=${report.outcome} reachedTarget=${reachedTarget} steps=${steps} checks=${report.verifiedChecks.length} floods=${screenFloods.length}`);
  const inventory = {
    items: [...state.inventory].sort().map((id) => `${id} ${getItem(id).name}`),
    keys: Object.fromEntries([...state.keys].filter(([, n]) => n > 0)),
    bigKeys: [...state.bigKeys].sort().map((id) => `${id} ${getDungeon(id).name}`),
    events: [...state.events].sort(),
    loadout: readLoadout(),
  };
  const outPath = await appApi().writeSimRun({ ...report, screenFloods, visits, path, checks, log, inventory, tally, endSummary });
  console.log(`[SimRun] Written to: ${outPath}`);
};

export { runFullSimulation };
