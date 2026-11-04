/* @layer renderer-components @kind constants */
import type { PatternLists, PatternSlotConfigs } from '@drizztdourden08/tessera/composites';
import { HOST_NAME } from '@app/hooks/randomizer/lobby-setup';
import type { LobbyConnect, LobbyLocation } from '@app/hooks/randomizer/lobby-setup';
import { LOBBY_CODE_ALPHABET } from '@rotp/randomizer';

const LOCATION_OPTIONS: { value: LobbyLocation; label: string }[] = [
  { value: 'local', label: 'Local' },
  { value: 'lan', label: 'LAN' },
  { value: 'remote', label: 'Remote' },
];

const CONNECT_OPTIONS: { value: LobbyConnect; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'manual', label: 'Manual' },
];

const NO_LOBBIES_HINT =
  'No lobbies found. In Archipelia, turn on Show on the network for the lobby, or switch to Manual and paste the session code.';

const NETWORK_BLOCKED = 'Network access is blocked for Relic of the Past.';

const REMOTE_NEEDS_ADDRESS = 'A remote lobby is joined by address';

const NAME_PLACEHOLDER = 'Player Name / Slot Name';

const ANY_SEAT = '__any-seat__';

const ANY_SEAT_OPTION = { value: ANY_SEAT, label: 'Any open seat' };

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

export {
  ADDRESS_LISTS, ANY_SEAT, ANY_SEAT_OPTION, ADDRESS_SLOTS, CODE_PATTERN, CODE_SLOTS, CONNECT_OPTIONS, HOST_PATTERN, IP_PATTERN, LOCATION_OPTIONS, NAME_PLACEHOLDER, NETWORK_BLOCKED, NO_LOBBIES_HINT, REMOTE_NEEDS_ADDRESS,
};
