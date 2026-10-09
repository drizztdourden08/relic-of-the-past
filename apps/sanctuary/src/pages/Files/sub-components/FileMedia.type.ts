/* @layer sanctuary-site @kind types */
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import type { MediaKind } from '@site-kit/lib/media-kind';

type FileMediaProps = {
  file: SanctuaryFile;
  kind: MediaKind;
};

export type { FileMediaProps };
