/* @layer store-api @kind logic */
import { HUB_LIMITS } from '@rotp/hub-contracts';
import type { PackLinkResponse, StoreVersion } from '@rotp/hub-contracts';
import { storeBucket } from '../../storage/store-bucket';

const packLinkOf = async (key: string, version: StoreVersion): Promise<PackLinkResponse> => ({
  url: await storeBucket.signPreview(key, version.contentType),
  bytes: version.bytes,
  container: version.container,
  expiresAt: Date.now() + HUB_LIMITS.previewUrlSeconds * 1000,
});

export { packLinkOf };
