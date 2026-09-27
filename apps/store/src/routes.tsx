/* @layer store-site @kind component */
/**
 * The route table: a path pattern, who may see it, and what it renders. The kit's guard
 * walks this list in order, so `/publications/new` stands before `/publications/:rowId`.
 */
import type { RouteEntry } from '@site-kit/router/route-table';
import { SignIn } from '@site-kit/pages/SignIn/SignIn';
import { Account } from '@site-kit/pages/Account/Account';
import { Device } from '@site-kit/pages/Device/Device';
import { STORE_KINDS, KIND_SECTIONS } from './lib/kinds';
import { FEATURE_PERMISSION, REVIEW_PERMISSION } from './site/site-sections';
import { STORE_SITE_UI } from './site/site';
import { Home } from './pages/Home/Home';
import { Browse } from './pages/Browse/Browse';
import { Item } from './pages/Item/Item';
import { Author } from './pages/Author/Author';
import { Publications } from './pages/Publications/Publications';
import { Publish } from './pages/Publish/Publish';
import { Review } from './pages/Review/Review';
import { HomeSettings } from './pages/HomeSettings/HomeSettings';

const HOME_PATH = '/home';

const KIND_ROUTES: RouteEntry[] = STORE_KINDS.flatMap((kind): RouteEntry[] => [
  { pattern: `/${KIND_SECTIONS[kind]}`, access: 'member', render: () => <Browse kind={kind} /> },
  { pattern: `/${KIND_SECTIONS[kind]}/:id`, access: 'member', render: ({ id }) => <Browse kind={kind} selectedId={id} /> },
]);

const ROUTES: RouteEntry[] = [
  { pattern: '/', access: 'member', render: () => <Home /> },
  { pattern: HOME_PATH, access: 'member', render: () => <Home /> },
  { pattern: '/browse', access: 'member', render: () => <Browse kind={null} /> },
  { pattern: '/browse/:id', access: 'member', render: ({ id }) => <Browse kind={null} selectedId={id} /> },
  ...KIND_ROUTES,
  { pattern: '/items/:id', access: 'member', render: ({ id }) => <Item id={id} /> },
  { pattern: '/authors/:userId', access: 'member', render: ({ userId }) => <Author userId={userId} /> },
  { pattern: '/publications', access: 'member', render: () => <Publications /> },
  { pattern: '/publications/new', access: 'member', render: () => <Publish mode="new" /> },
  { pattern: '/publications/:itemId/version', access: 'member', render: ({ itemId }) => <Publish mode="version" itemId={itemId} /> },
  { pattern: '/publications/:itemId/listing', access: 'member', render: ({ itemId }) => <Publish mode="listing" itemId={itemId} /> },
  { pattern: '/publications/:rowId', access: 'member', render: ({ rowId }) => <Publications selectedId={rowId} /> },
  { pattern: '/review', access: 'member', permission: REVIEW_PERMISSION, render: () => <Review /> },
  { pattern: '/review/:rowId', access: 'member', permission: REVIEW_PERMISSION, render: ({ rowId }) => <Review selectedId={rowId} /> },
  { pattern: '/curate', access: 'member', permission: FEATURE_PERMISSION, render: () => <HomeSettings /> },
  { pattern: '/account', access: 'member', render: () => <Account /> },
  { pattern: '/device/:code', access: 'member', bare: true, render: ({ code }) => <Device code={code} /> },
  { pattern: '/signin', access: 'public', bare: true, render: () => <SignIn lead={STORE_SITE_UI.signIn.lead} /> },
];

export { ROUTES, HOME_PATH };
