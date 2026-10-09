/* @layer sanctuary-site @kind types */
import type { SanctuaryFile } from '@shared/sanctuary/file-types';

type Versioned = Pick<SanctuaryFile, 'versions' | 'currentVersion'>;

export type { Versioned };
