/* @layer shared-game @kind logic */
import { COPIER_HEADER_SIZE } from './audit.constants';

const stripCopierHeader = (bytes: Uint8Array): Uint8Array =>
  bytes.length % 1024 === COPIER_HEADER_SIZE ? bytes.subarray(COPIER_HEADER_SIZE) : bytes;

export { stripCopierHeader };
