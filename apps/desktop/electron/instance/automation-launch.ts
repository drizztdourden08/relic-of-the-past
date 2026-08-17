/* @layer electron-main @kind logic */
/**
 * Is this launch automation rather than a person playing?
 *
 * An automated launch is READ-ONLY with respect to the shared configuration. Anything
 * every launch shares belongs to the person at the keyboard, and an agent run must never
 * change it:
 *   config/window-state.json   the window's size, position and mode
 *   app.json → lastProfileId   which profile opens by default next time
 *
 * The rule is enforced here rather than trusted to callers: an agent that forgets
 * --instance still cannot repoint the default profile or move the window. Instructions
 * say what to do; this makes the damage impossible either way.
 *
 * Any of the test/automation flags is enough of a signal. --no-focus is included because
 * every automated launch is required to pass it (docs/contributing/testing.md), so it is
 * the broadest catch for a run that forgot the rest.
 */

// Flags that mark a launch as automation. Matched as a bare flag or with a `=value`,
// so both `--window-size` and `--window-size=1280x800` count.
const AUTOMATION_FLAGS = [
  '--instance',
  '--profile',
  '--auto-state',
  '--screenshot',
  '--dump-layers',
  '--dump-nav',
  '--sim-run',
  '--fresh',
  '--window-size',
  '--no-focus',
];

const isAutomationLaunch = (): boolean =>
  process.argv.some((arg) =>
    AUTOMATION_FLAGS.some((flag) => arg === flag || arg.startsWith(`${flag}=`)),
  );

// Flags that mean "run with no human watching" — everything in AUTOMATION_FLAGS except
// --instance/--profile, which only select an identity/profile and say nothing about
// whether anyone is meant to see the window. A bare `--instance=NAME` launch (the
// collaborative-testing case: a tagged, independent, but human-usable window) must stay
// visible; `--instance=NAME --no-focus` (a real automated run) must still go headless.
const HEADLESS_FLAGS = AUTOMATION_FLAGS.filter((flag) => flag !== '--instance' && flag !== '--profile');

const isHeadlessLaunch = (): boolean =>
  process.argv.some((arg) =>
    HEADLESS_FLAGS.some((flag) => arg === flag || arg.startsWith(`${flag}=`)),
  );

export { AUTOMATION_FLAGS, HEADLESS_FLAGS, isAutomationLaunch, isHeadlessLaunch };
