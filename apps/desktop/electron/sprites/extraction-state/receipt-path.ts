/* @layer electron-main @kind logic */
import { join } from 'path';
import { RECEIPT_FILE } from './extraction-state.constants';

const receiptPath = (outDir: string): string => join(outDir, RECEIPT_FILE);

export { receiptPath };
