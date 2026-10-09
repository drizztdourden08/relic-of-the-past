/* @layer shared-storage @kind types */
import type { LanguageSetMeta } from '../../messages';

type SetHeader = LanguageSetMeta & { format?: number; structure?: string } & Record<string, unknown>;

export type { SetHeader };
