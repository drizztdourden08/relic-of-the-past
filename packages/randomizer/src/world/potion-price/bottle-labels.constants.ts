/* @layer shared-game @kind constants */
import { BOTTLE_CONTENTS } from '../shops/shop-price-options';

const BOTTLE_LABEL_OF: ReadonlyMap<string, string> = new Map(
  BOTTLE_CONTENTS.map(({ content, label }) => [content, label]),
);

export { BOTTLE_LABEL_OF };
