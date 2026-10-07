/* @layer sanctuary-site @kind component */
/**
 * The route table: a path pattern, who may see it, and what it renders. The kit's guard
 * walks this list, so a new page is one entry here.
 */
import { REPORTS_PERMISSION } from '@shared/sanctuary/sanctuary-rights';
import type { RouteEntry } from '@site-kit/router/route-table';
import { SignIn } from '@site-kit/pages/SignIn/SignIn';
import { Account } from '@site-kit/pages/Account/Account';
import { Admin } from '@site-kit/pages/Admin/Admin';
import { Device } from '@site-kit/pages/Device/Device';
import { Files } from './pages/Files/Files';
import { Reports } from './pages/Reports/Reports';
import { SANCTUARY_SITE_UI } from './site/site';

const HOME_PATH = '/files';

const ROUTES: RouteEntry[] = [
  { pattern: '/', access: 'member', render: () => <Files /> },
  { pattern: '/files', access: 'member', render: () => <Files /> },
  { pattern: '/files/:id', access: 'member', render: ({ id }) => <Files selectedId={id} /> },
  { pattern: '/reports', access: 'member', permission: REPORTS_PERMISSION, render: () => <Reports /> },
  { pattern: '/reports/:id', access: 'member', permission: REPORTS_PERMISSION, render: ({ id }) => <Reports selectedId={id} /> },
  { pattern: '/account', access: 'member', render: () => <Account /> },
  { pattern: '/admin', access: 'admin', render: () => <Admin /> },
  { pattern: '/device/:code', access: 'member', bare: true, render: ({ code }) => <Device code={code} /> },
  { pattern: '/signin', access: 'public', bare: true, render: () => <SignIn lead={SANCTUARY_SITE_UI.signIn.lead} /> },
];

export { ROUTES, HOME_PATH };
