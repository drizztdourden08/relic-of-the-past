/* @layer renderer-components @kind logic */
import type { Token } from '@rotp/languages';

const isSetting = (token: Token, name: string): boolean => token.t === 'cmd' && token.name === name;

export { isSetting };
