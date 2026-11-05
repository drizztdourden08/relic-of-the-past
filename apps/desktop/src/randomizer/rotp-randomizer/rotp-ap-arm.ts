/* @layer renderer-app @kind logic */
import type { ArchipelagoGame } from '@drizztdourden08/brock-randomizer';
import { setOnlineBits } from '@app/game/gate-word-5';
import { onlineBitsFor } from './rotp-ap-online-bits';

const rotpApArm: NonNullable<ArchipelagoGame<unknown, unknown>['arm']> = (connection) => {
  setOnlineBits(onlineBitsFor(connection.deathLink));
};

export { rotpApArm };
