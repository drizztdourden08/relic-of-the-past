/* @layer renderer-components @kind constants */
import type { IconName } from '@drizztdourden08/tessera/primitives';

const DOMAIN_ICONS: Record<string, IconName> = {
  profiles: 'user',
  roms: 'gamepad-2',
  sprites: 'image',
  linkSprites: 'palette',
  languages: 'globe',
  msu: 'headphones',
  assets: 'package',
  saves: 'save',
};

export { DOMAIN_ICONS };
