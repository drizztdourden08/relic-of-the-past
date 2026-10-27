/* @layer website-site @kind constants */
import type { FooterLink } from '../../design';
import { LEGAL_PATHS } from '../../routes';
import { REPO_HOME_URL } from '../../repo';

const FOOTER_LINKS: FooterLink[] = [
  { id: 'source', label: 'Source on GitHub', href: REPO_HOME_URL, external: true },
  { id: 'privacy', label: 'Privacy Policy', href: LEGAL_PATHS.privacy },
  { id: 'terms', label: 'Terms of Service', href: LEGAL_PATHS.terms },
];

const FOOTER_TEXT = {
  linksLabel: 'Site links',
  copyright: (year: number): string => `Copyright ${year} Relic of the Past contributors. MIT License.`,
  legal:
    'A fan-made, open-source project. Not affiliated with or endorsed by Nintendo. The Legend of Zelda is a trademark of Nintendo. Bring your own ROM: no copyrighted game assets are distributed.',
} as const;

export { FOOTER_LINKS, FOOTER_TEXT };
