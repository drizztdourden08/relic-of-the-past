/* @layer shared-sanctuary @kind types */
import type { SANCTUARY_ROUTES } from './api-contract';

type SanctuaryRoute = keyof typeof SANCTUARY_ROUTES;

export type { SanctuaryRoute };
