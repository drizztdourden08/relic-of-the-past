/* @layer shared-game @kind logic */
import { IDENT } from './record-codegen.constants';
import { quote } from './quote';

const propKey = (k: string): string => (IDENT.test(k) ? k : quote(k));

export { propKey };
