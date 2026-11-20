/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
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

const DOMAIN_LABELS: Record<string, Message> = {
  profiles: msg('views-data-home:domain.profiles'),
  roms: msg('views-data-home:domain.roms'),
  assets: msg('views-data-home:domain.assets'),
  sprites: msg('views-data-home:domain.sprites'),
  linkSprites: msg('views-data-home:domain.link-sprites'),
  languages: msg('views-data-home:domain.languages'),
  msu: msg('views-data-home:domain.msu'),
  logs: msg('views-data-home:domain.logs'),
};

export { DOMAIN_ICONS, DOMAIN_LABELS };
