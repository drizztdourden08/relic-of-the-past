/* @layer sanctuary-site @kind types */
import type { SanctuaryFile } from '@rotp/hub-contracts';
import type { MediaKind } from '@rotp/hub-client';

type FileMediaProps = {
  file: SanctuaryFile;
  kind: MediaKind;
};

export type { FileMediaProps };
