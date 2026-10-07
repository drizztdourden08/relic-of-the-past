/* @layer root-config @kind logic */
/** The Sanctuary as hub-core sees it: an approval site on its own origin, with the
 *  file and report permissions, the two list surfaces, and the default group that
 *  sees everything. */
import { SANCTUARY_RIGHTS, SANCTUARY_VIEW_SURFACES } from '../../../shared/sanctuary';
import type { SiteConfig } from '../../hub-core/site-config.type';
import { readSanctuaryEnv } from './env';

const SANCTUARY_SITE: SiteConfig = {
  id: 'sanctuary',
  origin: () => readSanctuaryEnv().SANCTUARY_ORIGIN,
  access: 'approval',
  rights: SANCTUARY_RIGHTS,
  viewSurfaces: SANCTUARY_VIEW_SURFACES,
  defaultGroup: { name: 'Contributors', rights: { sanctuary: [...SANCTUARY_RIGHTS.all] } },
};

export { SANCTUARY_SITE };
