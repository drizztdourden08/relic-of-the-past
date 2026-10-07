/* @layer electron-main @kind logic */
/**
 * Is this launch automation, not a person playing?
 *
 * An automated launch is READ-ONLY for the shared configuration, which belongs to the
 * person at the keyboard:
 *   config/window-state.json   the window's size, position and mode
 *   app.json -> lastProfileId   which profile opens by default next time
 *
 * Enforced here, not trusted to callers: an agent that forgets --instance still cannot
 * repoint the default profile or move the window. --no-focus counts because every
 * automated launch must pass it (docs/contributing/testing.md).
 */

// Matched as a bare flag or with `=value`, so `--window-size=1280x800` counts too.
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

const isAutomationLaunch = (): boolean =>
  process.argv.some((arg) =>
    AUTOMATION_FLAGS.some((flag) => arg === flag || arg.startsWith(`${flag}=`)),
  );

// "No human watching": everything except --instance/--profile, which only select an
// identity. A bare `--instance=NAME` launch (a tagged but human-usable window) stays
// visible; `--instance=NAME --no-focus` still goes headless.
const HEADLESS_FLAGS = AUTOMATION_FLAGS.filter((flag) => flag !== '--instance' && flag !== '--profile');

/**
 * `--visible` is the explicit handover override (`--auto-state=... --visible` pins a
 * state for a person to look at) and beats the heuristic. Without it every state-pinned
 * launch was forced headless and a "visible" handover produced no window at all.
 */
const isHeadlessLaunch = (): boolean => {
  if (process.argv.includes('--visible')) return false;
  return process.argv.some((arg) =>
    HEADLESS_FLAGS.some((flag) => arg === flag || arg.startsWith(`${flag}=`)),
  );
};

export { AUTOMATION_FLAGS, HEADLESS_FLAGS, isAutomationLaunch, isHeadlessLaunch };
