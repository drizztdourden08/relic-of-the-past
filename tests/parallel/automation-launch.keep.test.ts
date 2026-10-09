/* @layer test @kind test */
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
    withArgv(['--no-focus', '--muted', '--profile=agent-one', '--auto-state=test-jail-cell'], () =>
      expect(isAutomationLaunch()).toBe(true));
  });

  it('does not match a flag that merely starts with the same letters', () => {
    withArgv(['--screenshots-enabled'], () => expect(isAutomationLaunch()).toBe(false));
    withArgv(['--profiler'], () => expect(isAutomationLaunch()).toBe(false));
  });

  it('covers the two shared files by covering their triggers', () => {
    for (const flag of ['--auto-state=1', '--screenshot=x', '--instance=a', '--window-size=800x600']) {
      withArgv([flag], () => expect(isAutomationLaunch(), flag).toBe(true));
    }
  });
});
