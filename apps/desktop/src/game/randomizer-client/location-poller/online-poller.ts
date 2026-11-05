/* @layer bridge-wasm @kind logic */
import { appRandomizerLog, createLocationPoller } from '@drizztdourden08/brock-randomizer/session';
import { rotpMemoryBridge } from '@app/randomizer/rotp-randomizer/rotp-memory-bridge';
import { rotpPoll } from '@app/randomizer/rotp-randomizer/rotp-poll';

const onlinePoller = createLocationPoller({ memory: rotpMemoryBridge, ...rotpPoll, log: appRandomizerLog });

export { onlinePoller };
