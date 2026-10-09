/* @layer electron-main @kind constants */
const AUTOMATION_FLAGS = [
  '--instance',
  '--profile',
  '--auto-state',
  '--auto-start',
  '--screenshot',
  '--dump-layers',
  '--dump-nav',
  '--sim-run',
  '--fresh',
  '--window-size',
  '--no-focus',
];

const HEADLESS_FLAGS = AUTOMATION_FLAGS.filter((flag) => flag !== '--instance' && flag !== '--profile');

export { AUTOMATION_FLAGS, HEADLESS_FLAGS };
