/* @layer site-kit @kind types */
import type { createViewStorage } from './create-view-storage';

type SiteViews = ReturnType<typeof createViewStorage>;

export type { SiteViews };
