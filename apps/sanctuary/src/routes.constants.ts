/* @layer sanctuary-site @kind constants */
import { createElement } from 'react';
import { REPORTS_PERMISSION } from '@rotp/hub-contracts';
import type { RouteEntry } from '@rotp/design';
import { SignIn } from '@rotp/design';
import { Account } from '@rotp/design';
import { Admin } from '@rotp/design';
import { Device } from '@rotp/design';
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
