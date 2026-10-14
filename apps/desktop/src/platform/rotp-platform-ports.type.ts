/* @layer renderer-other @kind types */
import type { PlatformPorts } from '@drizztdourden08/brock-core/augment';
import type { BackEdgePort } from './back-edge-port.type';
import type { SpritesPort } from './sprites-port.type';

declare module '@drizztdourden08/brock-core/augment' {
  interface PlatformPorts {
    sprites?: SpritesPort;
    backEdge?: BackEdgePort;
  }
}

export type { PlatformPorts };
