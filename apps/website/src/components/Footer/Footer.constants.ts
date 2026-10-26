/* @layer website-site @kind constants */
import type { SiteLink } from '@drizztdourden08/tessera/composites';
import { REPO_HOME_URL } from '../../repo';

const FOOTER_LINKS: SiteLink[] = [{ id: 'source', label: 'Source on GitHub', href: REPO_HOME_URL, external: true }];

const FOOTER_TEXT = {
  copyright: (year: number): string => `Copyright ${year} Relic of the Past contributors. MIT License.`,
  legal:
    'A fan-made, open-source project. Not affiliated with or endorsed by Nintendo. The Legend of Zelda is a trademark of Nintendo. Bring your own ROM: no copyrighted game assets are distributed.',
} as const;

export { FOOTER_LINKS, FOOTER_TEXT };
