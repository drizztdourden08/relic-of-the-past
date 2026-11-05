/* @layer renderer-app @kind logic */
import { cancelServerDeliveries, clearForeignIcons, stopScoutedTexts } from '@rotp/randomizer';
import { clearCollectedChecks } from '@rotp/navigation';
import type { ArchipelagoGame } from '@drizztdourden08/brock-randomizer';
import { setOnlineBits } from '@app/game/gate-word-5';
import { onlineBitsFor } from './rotp-ap-online-bits';

const rotpApArm: NonNullable<ArchipelagoGame<unknown, unknown>['arm']> = (connection) => {
  setOnlineBits(onlineBitsFor(connection.deathLink));
};

const rotpApDisarm = (): void => {
  stopScoutedTexts();
  clearForeignIcons();
  cancelServerDeliveries();
  clearCollectedChecks();
  setOnlineBits(0);
};

export { rotpApArm, rotpApDisarm };
