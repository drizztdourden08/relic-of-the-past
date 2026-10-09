/* @layer renderer-appshell @kind logic */
import type { SimRunConfig } from '@rotp/navigation';
import { probeRoom, scanRoomsForSprite } from '@app/game/simulator';
import { simFloodScreen } from './sim-flood-screen';
import { simCombatSprite } from './sim-combat-sprite';

const runSimDiagnostic = (config: SimRunConfig): object | null => {
  if (config.floodScreen !== null) return simFloodScreen(config, config.floodScreen);

  if (config.scanSprite !== null) {
    const hits = scanRoomsForSprite(config.scanSprite);
    console.log(`[SimRun] sprite 0x${config.scanSprite.toString(16)} in ${hits.length} rooms`);
    return { scanSprite: config.scanSprite, hits };
  }

  if (config.probeRoom !== null) {
    const probe = probeRoom(config.probeRoom, config.probeTile ?? undefined,
      ['lift.1', ...(config.probeItems ?? [])] as Parameters<typeof probeRoom>[2]);
    console.log(`[SimRun] room 0x${config.probeRoom.toString(16)}: ${JSON.stringify(probe)}`);
    return { probe };
  }

  if (config.combatSprite !== null) return simCombatSprite(config.combatSprite);

  return null;
};

export { runSimDiagnostic };
