/* @layer sanctuary-site @kind logic */
/** How big a pick of files is, and whether it is small enough to zip in the browser. */
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import { BATCH_ZIP_MAX_BYTES } from '../Files.constants';

const totalBytes = (files: readonly SanctuaryFile[]) => files.reduce((sum, file) => sum + file.bytes, 0);

const fitsInZip = (files: readonly SanctuaryFile[]) => totalBytes(files) <= BATCH_ZIP_MAX_BYTES;

export { totalBytes, fitsInZip };
