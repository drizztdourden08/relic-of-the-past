/* @layer shared-game @kind logic */
import type { FillWorldOptions } from '../../fill-world.type';
import type { FillDefaults } from './fill-defaults.type';
import { itemDefaultsOf } from './item-defaults-of';
import { scopeDefaultsOf } from './scope-defaults-of';
import { shopPondDefaultsOf } from './shop-pond-defaults-of';

const resolveFillDefaults = (options: FillWorldOptions): FillDefaults => ({
  ...scopeDefaultsOf(options),
  ...shopPondDefaultsOf(options),
  ...itemDefaultsOf(options),
});

export { resolveFillDefaults };
