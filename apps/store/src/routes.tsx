/* @layer store-site @kind component */
import type { RouteEntry } from '@rotp/design';
import { SignIn } from '@rotp/design';
import { Account } from '@rotp/design';
import { Device } from '@rotp/design';
import { STORE_KINDS, KIND_SECTIONS } from './lib/kinds/kinds.constants';
import { FEATURE_PERMISSION, REVIEW_PERMISSION } from './site/site-sections/site-sections.constants';
import { STORE_SITE_UI } from './site/site.constants';
import { HOME_PATH } from './routes.constants';
import { Home } from './pages/Home/Home';
import { Browse } from './pages/Browse/Browse';
import { Item } from './pages/Item/Item';
import { Author } from './pages/Author/Author';
import { Publications } from './pages/Publications/Publications';
import { Publish } from './pages/Publish/Publish';
import { Review } from './pages/Review/Review';
import { ReviewItem } from './pages/ReviewItem/ReviewItem';
import { Administration } from './pages/Administration/Administration';

const kindRoutes: RouteEntry[] = STORE_KINDS.flatMap((kind): RouteEntry[] => [
  { pattern: `/${KIND_SECTIONS[kind]}`, access: 'member', render: () => <Browse kind={kind} /> },
  { pattern: `/${KIND_SECTIONS[kind]}/:id`, access: 'member', render: ({ id }) => <Browse kind={kind} selectedId={id} /> },
]);

const routes: RouteEntry[] = [
  { pattern: '/', access: 'member', render: () => <Home /> },
  { pattern: HOME_PATH, access: 'member', render: () => <Home /> },
  { pattern: '/browse', access: 'member', render: () => <Browse kind={null} /> },
  { pattern: '/browse/:id', access: 'member', render: ({ id }) => <Browse kind={null} selectedId={id} /> },
  ...kindRoutes,
  { pattern: '/items/:id', access: 'member', render: ({ id }) => <Item id={id} /> },
  { pattern: '/authors/:userId', access: 'member', render: ({ userId }) => <Author userId={userId} /> },
  { pattern: '/publications', access: 'member', render: () => <Publications /> },
  { pattern: '/publications/new', access: 'member', render: () => <Publish mode="new" /> },
  { pattern: '/publications/:itemId/version', access: 'member', render: ({ itemId }) => <Publish mode="version" itemId={itemId} /> },
  { pattern: '/publications/:itemId/listing', access: 'member', render: ({ itemId }) => <Publish mode="listing" itemId={itemId} /> },
  { pattern: '/publications/:rowId', access: 'member', render: ({ rowId }) => <Publications selectedId={rowId} /> },
  { pattern: '/review', access: 'member', permission: REVIEW_PERMISSION, render: () => <Review /> },
  { pattern: '/review/:rowId', access: 'member', permission: REVIEW_PERMISSION, render: ({ rowId }) => <ReviewItem key={rowId} rowId={rowId} /> },
  { pattern: '/admin', access: 'member', permission: FEATURE_PERMISSION, render: () => <Administration /> },
  { pattern: '/account', access: 'member', render: () => <Account /> },
  { pattern: '/device/:code', access: 'member', bare: true, render: ({ code }) => <Device code={code} /> },
  { pattern: '/signin', access: 'public', bare: true, render: () => <SignIn lead={STORE_SITE_UI.signIn.lead} /> },
];

export { routes };
