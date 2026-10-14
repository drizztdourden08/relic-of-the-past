/* @layer tests @kind helper */
import { createPlatform } from '@drizztdourden08/brock-core';
import type { Platform } from '@drizztdourden08/brock-core';
import { createWebFactory } from '@drizztdourden08/brock-react';

const webFactory = createWebFactory();

const WINDOWS_PLATFORM: Platform = createPlatform({ ...webFactory, info: { ...webFactory.info, os: 'windows' } });

export { WINDOWS_PLATFORM };
