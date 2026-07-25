/* @layer test @kind test */
/**
 * The automation predicate decides whether a launch may write the configuration every
 * launch shares — which profile opens by default, and where the window sits.
 *
 * It must answer YES for every automation flag, including a run that forgot `--instance`,
 * and NO for an ordinary launch. Getting it wrong in the permissive direction means an
 * agent run silently repoints the user's default profile.
 */
import { describe, it, expect, afterEach } from 'vitest';
// @ts-expect-error -- plain .ts module under electron/, imported here for its pure logic
import { AUTOMATION_FLAGS, isAutomationLaunch } from '../../apps/desktop/electron/instance/automation-launch';

const REAL_ARGV = process.argv;

const withArgv = (args: string[], assert: () => void) => {
  process.argv = ['node', 'main.js', ...args];
  assert();
};

afterEach(() => {
  process.argv = REAL_ARGV;
});

describe('isAutomationLaunch', () => {
  it('is false for an ordinary launch', () => {
    withArgv([], () => expect(isAutomationLaunch()).toBe(false));
  });

  it('is false for flags that are not about automation', () => {
    withArgv(['--muted', '--boot-timing'], () => expect(isAutomationLaunch()).toBe(false));
  });

  it('recognises every automation flag on its own', () => {
    for (const flag of AUTOMATION_FLAGS) {
      withArgv([flag], () => expect(isAutomationLaunch(), `bare ${flag}`).toBe(true));
      withArgv([`${flag}=x`], () => expect(isAutomationLaunch(), `${flag}=x`).toBe(true));
    }
  });

  it('catches an automated run that forgot --instance', () => {
    // The case that motivated widening the guard: pinned to another profile, no instance.
    withArgv(['--no-focus', '--muted', '--profile=agent-one', '--auto-state=test-jail-cell'], () =>
      expect(isAutomationLaunch()).toBe(true));
  });

  it('does not match a flag that merely starts with the same letters', () => {
    withArgv(['--screenshots-enabled'], () => expect(isAutomationLaunch()).toBe(false));
    withArgv(['--profiler'], () => expect(isAutomationLaunch()).toBe(false));
  });

  it('covers the two shared files by covering their triggers', () => {
    // app.json is written via loadProfileForGame (--auto-state / --screenshot paths);
    // window-state.json on close. Both are reached by these flags.
    for (const flag of ['--auto-state=1', '--screenshot=x', '--instance=a', '--window-size=800x600']) {
      withArgv([flag], () => expect(isAutomationLaunch(), flag).toBe(true));
    }
  });
});
