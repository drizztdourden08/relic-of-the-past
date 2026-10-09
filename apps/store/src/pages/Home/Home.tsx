/* @layer store-site @kind component */
import { Stack, Text } from '@drizztdourden08/tessera/primitives';
import type { ItemCardView } from '@rotp/hub-contracts';
import { SitePage, useSessionContext } from '@rotp/design';
import { FeaturedHero } from '../../components/FeaturedHero/FeaturedHero';
import { Shelf } from '../../components/Shelf/Shelf';
import { itemPath } from '../../catalog/item-paths';
import { formatCount } from '../../lib/format-count';
import { KIND_PLURALS, KIND_SECTIONS } from '../../lib/kinds';
import { useHome } from './behavior/useHome';
import { PublishAction } from './sub-components/PublishAction';
import { Welcome } from './sub-components/Welcome';
import './Home.css';

const monthlyInstalls = (item: ItemCardView) => `${formatCount(item.installs30d)} this month`;

const Home = () => {
  const { me } = useSessionContext();
  const { home, loading, error, kindShelves } = useHome();
  return (
    <SitePage section="home" actions={<PublishAction />}>
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
