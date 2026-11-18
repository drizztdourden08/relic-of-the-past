/* @layer renderer-components @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { PatternLists, PatternSlotConfigs } from '@drizztdourden08/tessera/composites';
import { HOST_NAME } from '@app/hooks/randomizer/lobby-setup';
import type { LobbyConnect, LobbyLocation } from '@app/hooks/randomizer/lobby-setup';
import { LOBBY_CODE_ALPHABET } from '@drizztdourden08/brock-randomizer/archipelago';

type TextOf = (message: Message) => string;

const LOCATION_OPTIONS: { value: LobbyLocation; label: Message }[] = [
  { value: 'local', label: msg('compounds:lobby-setup.location.local') },
  { value: 'lan', label: msg('compounds:lobby-setup.location.lan') },
  { value: 'remote', label: msg('compounds:lobby-setup.location.remote') },
];

const CONNECT_OPTIONS: { value: LobbyConnect; label: Message }[] = [
  { value: 'auto', label: msg('compounds:lobby-setup.connect.auto') },
  { value: 'manual', label: msg('compounds:lobby-setup.connect.manual') },
];

const NO_LOBBIES_HINT = msg('compounds:lobby-setup.no-lobbies-hint');

const REMOTE_NEEDS_ADDRESS = msg('compounds:lobby-setup.remote-needs-address');

const ANY_SEAT = '__any-seat__';

const ANY_SEAT_LABEL = msg('compounds:lobby-setup.any-seat');

const CODE_PATTERN = '{left:text len4 upper}-{right:text len4 upper}';

const CODE_ALIASES = { I: '1', L: '1', O: '0' };

const codeSlots = (text: TextOf): PatternSlotConfigs => ({
  left: { label: text(msg('compounds:lobby-setup.code.first-half')), placeholder: 'XXXX', chars: LOBBY_CODE_ALPHABET, aliases: CODE_ALIASES },
  right: { label: text(msg('compounds:lobby-setup.code.second-half')), placeholder: 'XXXX', chars: LOBBY_CODE_ALPHABET, aliases: CODE_ALIASES },
});

const HOST_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789.-';

const hostNameMessage = (text: TextOf) => (host: unknown): string | undefined =>
  host === null || host === undefined || HOST_NAME.test(String(host)) ? undefined : text(msg('compounds:lobby-setup.address.invalid-host'));

const PORT_SLOT = '{port:number 1..65535}';

const HOST_PATTERN = `{kind:choice @kinds} {host:text max253 lower}:${PORT_SLOT}`;

const IP_PATTERN =
  `{kind:choice @kinds} {a:number 0..255}.{b:number 0..255}.{c:number 0..255}.{d:number 0..255}:${PORT_SLOT}`;

const addressLists = (text: TextOf): PatternLists => ({
  kinds: [
    { value: 'host', label: text(msg('compounds:lobby-setup.address.host-name')) },
    { value: 'ip', label: text(msg('compounds:lobby-setup.address.ip')) },
  ],
});

const addressSlots = (text: TextOf): PatternSlotConfigs => ({
  kind: { label: text(msg('compounds:lobby-setup.address.kind')) },
  host: {
    label: text(msg('compounds:lobby-setup.address.host-name')),
    placeholder: text(msg('compounds:lobby-setup.address.host-placeholder')),
    chars: HOST_CHARS,
    validate: hostNameMessage(text),
  },
  a: { label: text(msg('compounds:lobby-setup.address.first-number')), placeholder: '0' },
  b: { label: text(msg('compounds:lobby-setup.address.second-number')), placeholder: '0' },
  c: { label: text(msg('compounds:lobby-setup.address.third-number')), placeholder: '0' },
  d: { label: text(msg('compounds:lobby-setup.address.fourth-number')), placeholder: '0' },
  port: { label: text(msg('compounds:lobby-setup.address.port')), placeholder: text(msg('compounds:lobby-setup.address.port-placeholder')) },
});

export {
  ANY_SEAT, ANY_SEAT_LABEL, CODE_PATTERN, CONNECT_OPTIONS, HOST_PATTERN, IP_PATTERN, LOCATION_OPTIONS, NO_LOBBIES_HINT, REMOTE_NEEDS_ADDRESS, addressLists, addressSlots, codeSlots,
};
export type { TextOf };
