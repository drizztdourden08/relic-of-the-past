/* @layer store-site @kind constants */
import { createElement } from 'react';
import type { RouteEntry } from '@rotp/design';
import { SignIn, Account, Device } from '@rotp/design';
import { STORE_KINDS, KIND_SECTIONS } from './kinds/kinds.constants';
import { FEATURE_PERMISSION, REVIEW_PERMISSION } from './site/site-sections/site-sections.constants';
import { STORE_SITE_UI } from './site/site.constants';
import { Home } from './pages/Home/Home';
import { Browse } from './pages/Browse/Browse';
import { Item } from './pages/Item/Item';
import { Author } from './pages/Author/Author';
import { Publications } from './pages/Publications/Publications';
import { Publish } from './pages/Publish/Publish';
import { Review } from './pages/Review/Review';
import { ReviewItem } from './pages/ReviewItem/ReviewItem';
import { Administration } from './pages/Administration/Administration';

const HOME_PATH = '/home';

const KIND_ROUTES: RouteEntry[] = STORE_KINDS.flatMap((kind): RouteEntry[] => [
  { pattern: `/${KIND_SECTIONS[kind]}`, access: 'member', render: () => createElement(Browse, { kind }) },
  { pattern: `/${KIND_SECTIONS[kind]}/:id`, access: 'member', render: ({ id }) => createElement(Browse, { kind, selectedId: id }) },
]);

const ROUTES: RouteEntry[] = [
  { pattern: '/', access: 'member', render: () => createElement(Home) },
  { pattern: HOME_PATH, access: 'member', render: () => createElement(Home) },
  { pattern: '/browse', access: 'member', render: () => createElement(Browse, { kind: null }) },
  { pattern: '/browse/:id', access: 'member', render: ({ id }) => createElement(Browse, { kind: null, selectedId: id }) },
  ...KIND_ROUTES,
  { pattern: '/items/:id', access: 'member', render: ({ id }) => createElement(Item, { id }) },
  { pattern: '/authors/:userId', access: 'member', render: ({ userId }) => createElement(Author, { userId }) },
  { pattern: '/publications', access: 'member', render: () => createElement(Publications) },
  { pattern: '/publications/new', access: 'member', render: () => createElement(Publish, { mode: 'new' }) },
  { pattern: '/publications/:itemId/version', access: 'member', render: ({ itemId }) => createElement(Publish, { mode: 'version', itemId }) },
  { pattern: '/publications/:itemId/listing', access: 'member', render: ({ itemId }) => createElement(Publish, { mode: 'listing', itemId }) },
  { pattern: '/publications/:rowId', access: 'member', render: ({ rowId }) => createElement(Publications, { selectedId: rowId }) },
  { pattern: '/review', access: 'member', permission: REVIEW_PERMISSION, render: () => createElement(Review) },
  { pattern: '/review/:rowId', access: 'member', permission: REVIEW_PERMISSION, render: ({ rowId }) => createElement(ReviewItem, { key: rowId, rowId }) },
  { pattern: '/admin', access: 'member', permission: FEATURE_PERMISSION, render: () => createElement(Administration) },
  { pattern: '/account', access: 'member', render: () => createElement(Account) },
  { pattern: '/device/:code', access: 'member', bare: true, render: ({ code }) => createElement(Device, { code }) },
  { pattern: '/signin', access: 'public', bare: true, render: () => createElement(SignIn, { lead: STORE_SITE_UI.signIn.lead }) },
];

export { HOME_PATH, ROUTES };
