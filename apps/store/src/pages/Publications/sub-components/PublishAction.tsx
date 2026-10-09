/* @layer store-site @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import plusIcon from '@iconify-icons/lucide/plus';
import { AppLink } from '@rotp/design';

const PublishAction = () => (
  <AppLink to="/publications/new" className="btn btn--primary btn--toned btn--sm publications__publish">
    <IconifyIcon icon={plusIcon} aria-hidden="true" /> Publish
  </AppLink>
);

export { PublishAction };
