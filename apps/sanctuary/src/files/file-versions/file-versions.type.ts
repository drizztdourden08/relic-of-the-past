/* @layer sanctuary-site @kind types */
import type { SanctuaryFile } from '@rotp/hub-contracts';

type Versioned = Pick<SanctuaryFile, 'versions' | 'currentVersion'>;

export type { Versioned };
