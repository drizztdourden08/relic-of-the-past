/* @layer shared-game @kind logic */
import { compileRule } from '../rule-eval';
import { priceNode } from './price-node';
import type { Rule } from '../../world.type';
import type { ShopPrice } from '../../shops/shop-price.type';

const ruleForPrice = (price: ShopPrice): Rule => compileRule(priceNode(price));

export { ruleForPrice };
