/* @layer store-site @kind component */
import { Stack } from '@ds/primitives/Stack';
import { ListingDetails } from './ListingDetails';
import { ManifestView } from './ManifestView';
import type { PackDetailsProps } from './PackDetails.type';
import { VersionDetails } from './VersionDetails';

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
