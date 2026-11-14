/* @layer renderer-app @kind data */
import type { ComponentUsage } from '@drizztdourden08/tessera';

const usage = {
  job: 'The Android options drawer: Home, Game, Profiles, the app menu with its sub-menus, the widgets and mute, opened by the back gesture from the right edge, plus the edge cue while no game plays.',
  useWhen: ['Once on Android, where a back swipe from the right edge opens it.'],
  avoidWhen: [{ case: 'The title bar of a desktop window.', use: 'WindowTitleBar' }],
  rules: ['Render it only when isMobileHost() is true.'],
  a11y: ['The drawer is a dialog with its own title; the back gesture closes it first.'],
  tree: { path: ['navigation', 'between a few modes, from a floating switch'], rule: 'The menu on hosts with no window chrome.' },
  example: `import { MobileShell } from '@app/views/MobileShell';\n\nconst Mobile = () => <MobileShell />;\n`,
  propsHash: '69a6789bb8733db8',
} satisfies ComponentUsage;

export { usage };
