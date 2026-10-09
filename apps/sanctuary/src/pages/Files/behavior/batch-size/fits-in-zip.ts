/* @layer sanctuary-site @kind logic */
import type { SanctuaryFile } from '@rotp/hub-contracts';
import { BATCH_ZIP_MAX_BYTES } from '../../Files.constants';
import { totalBytes } from './total-bytes';

const fitsInZip = (files: readonly SanctuaryFile[]) => totalBytes(files) <= BATCH_ZIP_MAX_BYTES;

export { fitsInZip };
