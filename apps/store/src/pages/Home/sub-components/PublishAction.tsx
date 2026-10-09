/* @layer store-site @kind component */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import plusIcon from '@iconify-icons/lucide/plus';
import { Link } from '@site-kit/router/Link';

const PublishAction = () => (
  <Link to="/publications/new" className="btn btn--secondary btn--sm home__publish">
    <IconifyIcon icon={plusIcon} aria-hidden="true" /> Publish
  </Link>
);

export { PublishAction };
