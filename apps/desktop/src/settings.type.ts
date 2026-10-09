/* @layer renderer-app @kind types */
import type { BaseSettings } from '@drizztdourden08/brock-core';
import type { GameSettings } from '@shared/types/settings';

interface AppSettings extends BaseSettings, GameSettings {}

export type { AppSettings };
