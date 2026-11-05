/* @layer renderer-app @kind logic */
import { cancelServerDeliveries, clearForeignIcons, stopScoutedTexts } from '@rotp/randomizer';
import { clearCollectedChecks } from '@rotp/navigation';
import { setOnlineBits } from '@app/game/gate-word-5';

const rotpApDisarm = (): void => {
  stopScoutedTexts();
  clearForeignIcons();
  cancelServerDeliveries();
  clearCollectedChecks();
  setOnlineBits(0);
};

export { rotpApDisarm };
