/* @layer store-site @kind component */
/**
 * The Details tab: every field of the listing, then for a version every field of the
 * version and its manifest read from the pack itself.
 */
import { Stack } from '@ds/primitives/Stack';
import type { StoreItem, StoreVersion } from '@shared/store/types';
import type { PackLink } from '../behavior/usePackLink';
import { ListingDetails } from './ListingDetails';
import { ManifestView } from './ManifestView';
import { VersionDetails } from './VersionDetails';

type PackDetailsProps = {
  item: StoreItem;
  /** The version under review; null for a listing edit. */
  version: StoreVersion | null;
  pack: PackLink;
  /** Why the pack cannot be read, when it cannot. */
  noPack: string | null;
};

const PackDetails = (props: PackDetailsProps) => {
  const { item, version, pack, noPack } = props;
  return (
    <Stack gap="lg" align="stretch" className="review-item__details">
      <ListingDetails item={item} />
      {version && <VersionDetails version={version} />}
      {version && <ManifestView source={pack.source} reason={noPack ?? pack.error} />}
    </Stack>
  );
};

export { PackDetails };
export type { PackDetailsProps };
