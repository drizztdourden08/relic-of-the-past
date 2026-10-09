/* @layer bridge-wasm @kind types */
import type { PlanShopOverride } from './physical-plan.type';

type ShopKey = Omit<PlanShopOverride, 'targetLocalId'>;

export type { ShopKey };
