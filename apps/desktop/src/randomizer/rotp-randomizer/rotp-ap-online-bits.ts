/* @layer renderer-app @kind logic */
import { AP_DEATH_LINK_BIT, AP_ONLINE_BIT } from '@app/game/gate-word-5';

const onlineBitsFor = (deathLink: boolean): number => AP_ONLINE_BIT | (deathLink ? AP_DEATH_LINK_BIT : 0);

export { onlineBitsFor };
