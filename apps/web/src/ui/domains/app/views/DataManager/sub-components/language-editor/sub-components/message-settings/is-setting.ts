/* @layer renderer-components @kind logic */
import type { Token } from '@shared/game/language';

const isSetting = (token: Token, name: string): boolean => token.t === 'cmd' && token.name === name;

export { isSetting };
