/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The form part that says where an Archipelia lobby is, its code and the name to join as.',
  useWhen: ['When a player joins an Archipelia lobby from the profile wizard.'],
  avoidWhen: [{ case: 'A plain Archipelago server with host, port and password.', use: 'Field' }],
  rules: ['Auto lists the lobbies of the found server, with their seats, and takes the chosen one with no code; a closed lobby shows but cannot be chosen; Manual takes an address and a code.', 'Remote is always Manual.', 'Pass the lobby answer in; the part never asks it.'],
  a11y: ['Each input has a label, and each slot of the code and the address has its own name.'],
  tree: { path: ['a value the user sets', 'a whole record', 'edit it in place'], rule: 'The lobby a profile joins.' },
  example: `import type { ComponentProps } from 'react';
import { LobbySetup } from '@app/compounds/LobbySetup';

const Mounted = (props: ComponentProps<typeof LobbySetup>) => <LobbySetup {...props} />;
`,
  propsHash: 'ae8ed1149ce2df07',
} satisfies ComponentUsage;

export { usage };
