/* @layer renderer-app @kind logic */
import type { ReceivedItem } from '@drizztdourden08/brock-randomizer/archipelago';
import { SERVER_SLOT } from './rotp-ap-is-from-server.constants';

const rotpApIsFromServer = (item: ReceivedItem): boolean => item.player === SERVER_SLOT || item.location < 0;

export { rotpApIsFromServer };
