/* @layer shared-game @kind logic */
import type { CodeInfo } from './code-catalog.type';
import { CATALOG_BY_NAME } from './code-catalog.constants';

const codeInfoFor = (name: string): CodeInfo | null => CATALOG_BY_NAME.get(name) ?? null;

export { codeInfoFor };
