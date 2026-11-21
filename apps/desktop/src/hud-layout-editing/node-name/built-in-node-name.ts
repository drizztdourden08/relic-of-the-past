/* @layer renderer-components @kind logic */
import { BUILT_IN_NODE_NAMES } from './node-name.constants';
import type { Translate } from '../translate.type';

const builtInNodeName = (id: string, t: Translate): string | undefined => {
  const key = BUILT_IN_NODE_NAMES[id];
  return key ? t(key) : undefined;
};

export { builtInNodeName };
