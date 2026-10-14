/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The Hookshop inside the app: a side list of sections for home, browse, each kind, installed packs and updates, with the content of the chosen section.',
  useWhen: ['As the body of the Hookshop screen, to browse, install, update and remove packs.'],
  avoidWhen: [{ case: 'A page of reading with no side list.', use: 'InfoScreen' }],
  rules: [
    'Pass onLibraryChanged so the profile and ROM lists refresh after an install or a removal.',
    'Pass onDeleteConfirm to confirm a removal in the app dialog, and section to open on a given section.',
  ],
  a11y: ['The side list is a navigation; each card is a button, and a pressed card is the selected one.'],
  tree: { path: ['a full screen view', 'working across pages, picked from a side list'], rule: 'The Hookshop pages.' },
  example: `import { Store } from '@app/views/Store';\n\nconst Hookshop = () => <Store section="home" onLibraryChanged={() => undefined} onDeleteConfirm={() => undefined} />;\n`,
  propsHash: 'e62989cb2aca7bc9',
} satisfies ComponentUsage;

export { usage };
