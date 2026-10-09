/* @layer shared-asset-extraction @kind logic */
import { kEndingCharset } from './ending-charset';

const endingCharAt = (index: number): string => kEndingCharset[index] ?? ' ';

export { endingCharAt };
