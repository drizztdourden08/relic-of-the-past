/* @layer store-api @kind logic */
import type { HomeView, ItemCardView } from '@rotp/hub-contracts';
import type { StoreItem } from '@rotp/hub-contracts';
import { itemsRepo } from '../db/items-repo';
import { settingsRepo } from '../db/settings-repo';
import { toCardView } from '../items/card-view';
import { signCards } from '../media/sign-media';
import { MIN_RATINGS_FOR_TOP, SHELF_SIZE, TOP_RATED_READ } from './build-home.constants';

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

export { buildHome };
