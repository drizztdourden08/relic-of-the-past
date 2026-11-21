/* @layer renderer-components @kind logic */
import { builtInNodeName } from './built-in-node-name';
import type { Translate } from '../translate.type';

const nodeName = (id: string, t: Translate): string => builtInNodeName(id, t) ?? id;

export { nodeName };
