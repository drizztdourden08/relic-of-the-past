/* @layer sanctuary-site @kind constants */
import { createElement } from 'react';
import { REPORTS_PERMISSION } from '@shared/sanctuary/sanctuary-rights';
import type { RouteEntry } from '@site-kit/router/route-table';
import { SignIn } from '@site-kit/pages/SignIn/SignIn';
import { Account } from '@site-kit/pages/Account/Account';
import { Admin } from '@site-kit/pages/Admin/Admin';
import { Device } from '@site-kit/pages/Device/Device';
import { Files } from './pages/Files/Files';
import { Reports } from './pages/Reports/Reports';
import { SANCTUARY_SITE_UI } from './site/site.constants';

const HOME_PATH = '/files';

const ROUTES: RouteEntry[] = [
  { pattern: '/', access: 'member', render: () => createElement(Files) },
  { pattern: '/files', access: 'member', render: () => createElement(Files) },
  { pattern: '/files/:id', access: 'member', render: ({ id }) => createElement(Files, { selectedId: id }) },
  { pattern: '/reports', access: 'member', permission: REPORTS_PERMISSION, render: () => createElement(Reports) },
  {
    pattern: '/reports/:id',
    access: 'member',
    permission: REPORTS_PERMISSION,
    render: ({ id }) => createElement(Reports, { selectedId: id }),
  },
  { pattern: '/account', access: 'member', render: () => createElement(Account) },
  { pattern: '/admin', access: 'admin', render: () => createElement(Admin) },
  { pattern: '/device/:code', access: 'member', bare: true, render: ({ code }) => createElement(Device, { code }) },
  { pattern: '/signin', access: 'public', bare: true, render: () => createElement(SignIn, { lead: SANCTUARY_SITE_UI.signIn.lead }) },
];

export { ROUTES, HOME_PATH };
