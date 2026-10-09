/* @layer store-api @kind logic */
import type { ItemCardView } from '../../../../../shared/store/home-types';
import { signRef } from './sign-ref';

const signCard = async (view: ItemCardView): Promise<ItemCardView> => {
  const [card, banner] = await Promise.all([signRef(view.card), signRef(view.banner)]);
  return { ...view, card, banner };
};

export { signCard };
