/* @layer shared-storage @kind types */
import type { LanguageSetMeta } from '@shared/game/language';

type SetHeader = LanguageSetMeta & { format?: number; structure?: string } & Record<string, unknown>;

export type { SetHeader };
