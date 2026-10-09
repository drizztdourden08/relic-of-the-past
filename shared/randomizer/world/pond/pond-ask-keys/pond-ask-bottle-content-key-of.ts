/* @layer shared-game @kind logic */
import { askKeyOf } from './ask-key-of';
import type { PondInstance } from '../pond-instance.type';
import type { ShopBottleContent } from '../../shops/shop-price.type';

const pondAskBottleContentKeyOf = (pond: PondInstance, content: ShopBottleContent): string =>
  `${askKeyOf(pond, 'bottle')}_${content.replace(/-/g, '_')}`;

export { pondAskBottleContentKeyOf };
