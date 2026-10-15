/* @layer site-kit @kind types */
import type { ViewKey } from '@drizztdourden08/tessera/data';

type ViewHalf = 'table' | 'query';

type ParsedViewKey = { surface: string; half: ViewHalf };

type ViewKeys = {
  surfaces: readonly string[];
  keyFor: (surface: string, half: ViewHalf, nonce?: number) => ViewKey;
  parse: (key: ViewKey) => ParsedViewKey | null;
  currentViewId: (surface: string) => string;
  isCurrentViewId: (id: string) => boolean;
};

export type { ViewKeys, ViewHalf };
