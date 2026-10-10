/* @layer shared-hub @kind types */
import type { PROVIDERS } from './providers.constants';

type Provider = (typeof PROVIDERS)[number];

export type { Provider };
