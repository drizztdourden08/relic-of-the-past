/* @layer renderer-app @kind types */
import type { SettingLayout } from '@drizztdourden08/brock-react';

interface ItemOverride {
  description?: string;
  layout?: SettingLayout;
}

type ItemOverrides = Readonly<Record<string, ItemOverride>>;

export type { ItemOverride, ItemOverrides };
