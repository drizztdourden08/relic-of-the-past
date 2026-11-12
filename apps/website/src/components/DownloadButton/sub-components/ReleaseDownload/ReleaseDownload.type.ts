/* @layer website-site @kind types */
import type { Release } from '../../../../github';
import type { Platform } from '../../../../platform';

type ReleaseDownloadProps = {
  release: Release;
  platform: Platform;
};

export type { ReleaseDownloadProps };
