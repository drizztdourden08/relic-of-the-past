/* @layer renderer-app @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { DataDomainDef } from '@drizztdourden08/brock-core';

const ROTP_DATA_DOMAINS: DataDomainDef[] = [
  { domain: 'profiles', label: msg('views-data-home:domain.profiles'), dir: 'profiles', description: msg('views-data-home:domain-description.profiles'), clearable: false },
  { domain: 'roms', label: msg('views-data-home:domain.roms'), dir: 'roms', description: msg('views-data-home:domain-description.roms'), clearable: false },
  { domain: 'assets', label: msg('views-data-home:domain.assets'), dir: 'assets', description: msg('views-data-home:domain-description.assets') },
  { domain: 'sprites', label: msg('views-data-home:domain.sprites'), dir: 'sprites', description: msg('views-data-home:domain-description.sprites') },
  { domain: 'linkSprites', label: msg('views-data-home:domain.link-sprites'), dir: 'link-sprites', description: msg('views-data-home:domain-description.link-sprites') },
  { domain: 'languages', label: msg('views-data-home:domain.languages'), dir: 'languages', description: msg('views-data-home:domain-description.languages') },
  { domain: 'msu', label: msg('views-data-home:domain.msu'), dir: 'msu', description: msg('views-data-home:domain-description.msu') },
  { domain: 'logs', label: msg('views-data-home:domain.logs'), dir: 'debug', description: msg('views-data-home:domain-description.logs'), cleanOlderThanDays: [7, 30], portable: false },
];

export { ROTP_DATA_DOMAINS };
