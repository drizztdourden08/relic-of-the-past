/* @layer store-api @kind logic */
import type { ItemCardView } from '@rotp/hub-contracts';
import { signCard } from './sign-card';

const signCards = (views: ItemCardView[]): Promise<ItemCardView[]> => Promise.all(views.map(signCard));

export { signCards };
