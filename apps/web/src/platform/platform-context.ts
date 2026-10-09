/* @layer renderer-other @kind logic */
import { createContext } from 'react';
import type { Platform } from '@shared/platform';

const PlatformContext = createContext<Platform | null>(null);

export { PlatformContext };
