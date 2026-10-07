/* @layer store-api @kind logic */
/** The home page from indexed queries: the welcome message, the featured row in the order
 *  it was set, then Popular this month (installs30d), Top rated (the weighted score, among
 *  items with enough ratings) and New and updated. Only published items show. */
import type { HomeView, ItemCardView } from '../../../../shared/store/home-types';
import type { StoreItem } from '../../../../shared/store/types';
import { itemsRepo } from '../db/items-repo';
import { settingsRepo } from '../db/settings-repo';
import { toCardView } from '../items/card-view';
import { signCards } from '../media/sign-media';

const SHELF_SIZE = 12;
/** Fewer ratings than this and an item stays off Top rated, whatever its score. */
const MIN_RATINGS_FOR_TOP = 3;
/** Rows read for Top rated before the minimum-count filter trims them. */
const TOP_RATED_READ = SHELF_SIZE * 4;

const shelf = (items: StoreItem[]): Promise<ItemCardView[]> => signCards(items.slice(0, SHELF_SIZE).map(toCardView));

const buildHome = async (): Promise<HomeView> => {
  const [home, featuredIds, popular, rated, fresh] = await Promise.all([
    settingsRepo.getHome(),
    settingsRepo.getFeatured(),
    itemsRepo.topPublished('stats.installs30d', SHELF_SIZE),
    itemsRepo.topPublished('stats.score', TOP_RATED_READ),
    itemsRepo.topPublished('updatedAt', SHELF_SIZE),
  ]);
  const featured = (await itemsRepo.getMany(featuredIds)).filter((item) => item.status === 'published');
  const topRated = rated.filter((item) => item.stats.ratingCount >= MIN_RATINGS_FOR_TOP);
  const [featuredCards, popularCards, topRatedCards, freshCards] = await Promise.all([
    shelf(featured),
    shelf(popular),
    shelf(topRated),
    shelf(fresh),
  ]);
  return { welcome: home?.welcome ?? '', featured: featuredCards, popular: popularCards, topRated: topRatedCards, fresh: freshCards };
};

export { buildHome, MIN_RATINGS_FOR_TOP };
