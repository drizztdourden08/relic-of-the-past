/* @layer renderer-appshell @kind types */
import type { useSettingsStore } from '@drizztdourden08/brock-react';
import type { AppSettings } from '@app/settings.type';

type AppSettingsStore = ReturnType<typeof useSettingsStore<AppSettings>>;

export type { AppSettingsStore };
