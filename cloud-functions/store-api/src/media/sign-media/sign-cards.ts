/* @layer store-api @kind logic */
import type { ItemCardView } from '../../../../../shared/store/home-types';
import { signCard } from './sign-card';

const signCards = (views: ItemCardView[]): Promise<ItemCardView[]> => Promise.all(views.map(signCard));

export { signCards };
