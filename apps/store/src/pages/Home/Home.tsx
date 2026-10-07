/* @layer store-site @kind component */
/**
 * Home: the welcome with the player's name, the featured row, then Popular this month,
 * Top rated, New and updated, and one shelf per kind. Publish sits in the header.
 */
import { Icon as IconifyIcon } from '@iconify/react/offline';
import plusIcon from '@iconify-icons/lucide/plus';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import type { ItemCardView } from '@shared/store/home-types';
import { SitePage } from '@site-kit/layout/SitePage/SitePage';
import { Link } from '@site-kit/router/Link';
import { useSessionContext } from '@site-kit/session/session-context';
import { FeaturedHero } from '../../components/FeaturedHero/FeaturedHero';
import { Shelf } from '../../components/Shelf/Shelf';
import { itemPath } from '../../catalog/item-paths';
import { formatCount } from '../../lib/format-count';
import { KIND_PLURALS, KIND_SECTIONS } from '../../lib/kinds';
import { useHome } from './behavior/useHome';
import { Welcome } from './sub-components/Welcome';
import './Home.css';

const monthlyInstalls = (item: ItemCardView) => `${formatCount(item.installs30d)} this month`;

const PUBLISH = (
  <Link to="/publications/new" className="btn btn--secondary btn--sm home__publish">
    <IconifyIcon icon={plusIcon} aria-hidden="true" /> Publish
  </Link>
);

const Home = () => {
  const { me } = useSessionContext();
  const { home, loading, error, kindShelves } = useHome();
  return (
    <SitePage section="home" actions={PUBLISH}>
      <Stack gap="xl" align="stretch" className="home">
        <Welcome name={me?.displayName ?? 'player'} message={home?.welcome ?? ''} />
        {error && <Text as="p" variant="caption" role="alert">{error}</Text>}
        {loading && <Text as="p" variant="caption">Loading the Hookshop...</Text>}
        {home && (
          <>
            <FeaturedHero items={home.featured} itemPath={itemPath} />
            <Shelf title="Popular this month" lead="by installs in the last 30 days" items={home.popular} itemPath={itemPath} extraOf={monthlyInstalls} seeAll="/browse" />
            <Shelf title="Top rated" lead="weighted by the number of ratings" items={home.topRated} itemPath={itemPath} seeAll="/browse" />
            <Shelf title="New and updated" lead="the latest approved versions" items={home.fresh} itemPath={itemPath} seeAll="/browse" />
          </>
        )}
        {kindShelves.map(({ kind, items }) => (
          <Shelf key={kind} title={KIND_PLURALS[kind]} items={items} itemPath={itemPath} seeAll={`/${KIND_SECTIONS[kind]}`} />
        ))}
      </Stack>
    </SitePage>
  );
};

export { Home };
