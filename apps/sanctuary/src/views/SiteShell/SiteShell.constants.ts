/* @layer renderer-app @kind constants */
import type { SiteLink } from '@drizztdourden08/tessera/composites';

const SITE_PATHS = { home: '/', signIn: '/sign-in' } as const;

const SITE_LINKS: SiteLink[] = [
  { id: 'home', label: 'Home', href: SITE_PATHS.home },
];

const FOOTER_LINKS: SiteLink[] = [
  { id: 'home', label: 'Home', href: SITE_PATHS.home },
];

const SHELL_TEXT = {
  title: 'Sanctuary Next',
  homeLabel: 'Sanctuary Next home',
  signIn: 'Sign in',
  signOut: 'Sign out',
  footer: 'Sanctuary Next, drawn with Tessera.',
  guest: 'Guest',
} as const;

export { SITE_PATHS, SITE_LINKS, FOOTER_LINKS, SHELL_TEXT };
