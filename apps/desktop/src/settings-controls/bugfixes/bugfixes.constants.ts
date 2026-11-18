/* @layer renderer-app @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';

const BUNDLE_GROUPS = [
  { origin: 'MiscBugFixes', id: 'bugfixes-misc', title: msg('settings-bugfixes:section.bugfixes-misc.title') },
  { origin: 'GameChangingBugFixes', id: 'bugfixes-gamechanging', title: msg('settings-bugfixes:section.bugfixes-gamechanging.title') },
] as const;

const FIX_STATE_HINTS = { on: msg('settings-bugfixes:state.on'), off: msg('settings-bugfixes:state.off'), atRest: true } as const;

export { BUNDLE_GROUPS, FIX_STATE_HINTS };
