/* @layer renderer-components @kind constants */
import type { PatternLists, PatternSlotConfigs } from '@drizztdourden08/tessera/composites';
import { HOST_NAME } from '@app/hooks/randomizer/lobby-setup';
import type { LobbyLocation } from '@app/hooks/randomizer/lobby-setup';
import { LOBBY_CODE_ALPHABET } from '@rotp/randomizer';

const LOCATION_OPTIONS: { value: LobbyLocation; label: string }[] = [
  { value: 'local', label: 'Local' },
  { value: 'lan', label: 'LAN' },
  { value: 'remote', label: 'Remote' },
];

const CODE_PATTERN = '{left:text len4 upper}-{right:text len4 upper}';

const CODE_ALIASES = { I: '1', L: '1', O: '0' };

const CODE_SLOTS: PatternSlotConfigs = {
  left: { label: 'First half', placeholder: 'XXXX', chars: LOBBY_CODE_ALPHABET, aliases: CODE_ALIASES },
  right: { label: 'Second half', placeholder: 'XXXX', chars: LOBBY_CODE_ALPHABET, aliases: CODE_ALIASES },
};

const HOST_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789.-';

const hostNameMessage = (host: unknown): string | undefined =>
  host === null || host === undefined || HOST_NAME.test(String(host)) ? undefined : 'Not a valid host name';

const PORT_SLOT = '{port:number 1..65535}';

const HOST_PATTERN = `{kind:choice @kinds} {host:text max253 lower}:${PORT_SLOT}`;

const IP_PATTERN =
  `{kind:choice @kinds} {a:number 0..255}.{b:number 0..255}.{c:number 0..255}.{d:number 0..255}:${PORT_SLOT}`;

const ADDRESS_LISTS: PatternLists = {
  kinds: [{ value: 'host', label: 'Host name' }, { value: 'ip', label: 'IP' }],
};

const ADDRESS_SLOTS: PatternSlotConfigs = {
  kind: { label: 'Address kind' },
  host: { label: 'Host name', placeholder: 'host name', chars: HOST_CHARS, validate: hostNameMessage },
  a: { label: 'First number', placeholder: '0' },
  b: { label: 'Second number', placeholder: '0' },
  c: { label: 'Third number', placeholder: '0' },
  d: { label: 'Fourth number', placeholder: '0' },
  port: { label: 'Port', placeholder: 'port' },
};

export { ADDRESS_LISTS, ADDRESS_SLOTS, CODE_PATTERN, CODE_SLOTS, HOST_PATTERN, IP_PATTERN, LOCATION_OPTIONS };
