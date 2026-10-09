/* @layer shared-game @kind logic */
import { helperRule } from '../combinators';
import type { Rule } from '../../world.type';

const canAfford = (price: number): Rule => helperRule('walletAtLeast', price);

export { canAfford };
