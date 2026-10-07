/* @layer renderer-components @kind types */
import type { StoreKind } from '@shared/store/types';
import type { PackSource } from '../../pack-source.type';

type PackContentsProps = {
  kind: StoreKind;
  /** Where the pack's bytes come from; a new source reads the pack again. */
  source: PackSource;
  className?: string;
};

export type { PackContentsProps };
