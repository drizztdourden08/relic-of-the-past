/* @layer renderer-components @kind constants */
import type { PatternLists, PatternSlotConfigs } from '@drizztdourden08/tessera/composites';
import type { LobbyLocation } from '@app/hooks/randomizer/lobby-setup';

const LOCATION_OPTIONS: { value: LobbyLocation; label: string }[] = [
  { value: 'local', label: 'Local' },
  { value: 'lan', label: 'LAN' },
  { value: 'remote', label: 'Remote' },
];

const CODE_PATTERN = '{left:text len4 alnum upper}-{right:text len4 alnum upper}';

const CODE_SLOTS: PatternSlotConfigs = {
  left: { label: 'First half', placeholder: 'XXXX' },
  right: { label: 'Second half', placeholder: 'XXXX' },
};

const PORT_SLOT = '{port:number 1..65535}';

const HOST_PATTERN = `{kind:choice @kinds} {host:text max253 lower}:${PORT_SLOT}`;

const IP_PATTERN =
  `{kind:choice @kinds} {a:number 0..255}.{b:number 0..255}.{c:number 0..255}.{d:number 0..255}:${PORT_SLOT}`;

const ADDRESS_LISTS: PatternLists = {
  kinds: [{ value: 'host', label: 'Host name' }, { value: 'ip', label: 'IP' }],
};

const ADDRESS_SLOTS: PatternSlotConfigs = {
  kind: { label: 'Address kind' },
  host: { label: 'Host name', placeholder: 'host name' },
  a: { label: 'First number', placeholder: '0' },
  b: { label: 'Second number', placeholder: '0' },
  c: { label: 'Third number', placeholder: '0' },
  d: { label: 'Fourth number', placeholder: '0' },
  port: { label: 'Port', placeholder: 'port' },
};

export { ADDRESS_LISTS, ADDRESS_SLOTS, CODE_PATTERN, CODE_SLOTS, HOST_PATTERN, IP_PATTERN, LOCATION_OPTIONS };
