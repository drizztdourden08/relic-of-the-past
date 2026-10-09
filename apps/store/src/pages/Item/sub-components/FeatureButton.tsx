/* @layer store-site @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import starIcon from '@iconify-icons/lucide/star';
import starOffIcon from '@iconify-icons/lucide/star-off';
import { Button } from '@drizztdourden08/tessera/primitives';
import { NOT_PUBLISHED } from './FeatureButton.constants';
import type { FeatureButtonProps } from './FeatureButton.type';

const FeatureButton = (props: FeatureButtonProps) => {
  const { item, listing } = props;
  if (item.featured) {
    return (
      <Button variant="secondary" size="sm" icon={<IconifyIcon icon={starOffIcon} />} busy={listing.busy} onClick={() => void listing.unfeature(item.id)}>
        Remove from featured
      </Button>
    );
  }
  const published = item.status === 'published';
  return (
    <Button
      variant="secondary"
      size="sm"
      icon={<IconifyIcon icon={starIcon} />}
      disabled={!published}
      busy={listing.busy}
      title={published ? 'Add it to the featured row on the home page' : NOT_PUBLISHED}
      onClick={() => void listing.feature(item.id)}
    >
      Feature
    </Button>
  );
};

export { FeatureButton };
