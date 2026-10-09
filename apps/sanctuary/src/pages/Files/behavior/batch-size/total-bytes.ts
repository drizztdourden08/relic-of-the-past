/* @layer sanctuary-site @kind logic */
import type { SanctuaryFile } from '@rotp/hub-contracts';

const totalBytes = (files: readonly SanctuaryFile[]) => files.reduce((sum, file) => sum + file.bytes, 0);

export { totalBytes };
