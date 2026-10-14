/* @layer electron-main @kind logic */
import { createAutomationFlags } from '@drizztdourden08/brock-core';
import { GAME_LAUNCH_FLAGS, ROTP_AUTOMATION_FLAGS, SCREENSHOT_FLAG } from './automation-flags.constants';

const widgetsOf = (argv: readonly string[]): string[] =>
  argv.filter((arg) => arg.startsWith('--widgets=')).flatMap((arg) => arg.slice('--widgets='.length).split(',')).map((id) => id.trim()).filter(Boolean);

const screenshotKindOf = (argv: readonly string[]): 'game' | 'hub' | null => {
  const flags = createAutomationFlags(ROTP_AUTOMATION_FLAGS);
  if (flags.flagValue(SCREENSHOT_FLAG, argv) === null) return null;
  return GAME_LAUNCH_FLAGS.some((flag) => flags.hasFlag(flag, argv)) ? 'game' : 'hub';
};

const rotpRendererFlags = (argv: string[]): string[] => {
  const flags: string[] = [];
  const widgets = widgetsOf(argv);
  if (widgets.length > 0) flags.push(`--startup-widgets=${widgets.join(',')}`);
  if (argv.includes('--auto-start')) flags.push('--startup-auto-start');
  if (argv.includes('--auto-flood')) flags.push('--startup-auto-flood');
  if (createAutomationFlags(ROTP_AUTOMATION_FLAGS).isHeadlessLaunch(argv) && !argv.includes('--sound')) flags.push('--startup-muted');
  const screenshot = screenshotKindOf(argv);
  if (screenshot) flags.push(`--startup-screenshot=${screenshot}`);
  return flags;
};

export { rotpRendererFlags };
