/* @layer shared-asset-extraction @kind logic */
import { buildCharset } from './build-charset';

const kEndingCharset: readonly string[] = buildCharset();

export { kEndingCharset };
