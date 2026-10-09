/* @layer renderer-app @kind types */
import type { BaseSettings } from '@drizztdourden08/brock-core';
import type { DisplaySettings } from '@drizztdourden08/brock-display';
import type { GameSettings } from '@shared/types/settings';

interface AppSettings extends BaseSettings, DisplaySettings, GameSettings {}

export type { AppSettings };
