/* @layer electron-main @kind logic */
import { createAutomationFlags } from '@drizztdourden08/brock-core';
import { ROTP_AUTOMATION_FLAGS } from './automation-flags.constants';

const widgetsOf = (argv: readonly string[]): string[] =>
  argv.filter((arg) => arg.startsWith('--widgets=')).flatMap((arg) => arg.slice('--widgets='.length).split(',')).map((id) => id.trim()).filter(Boolean);

const rotpRendererFlags = (argv: string[]): string[] => {
  const flags: string[] = [];
  const widgets = widgetsOf(argv);
  if (widgets.length > 0) flags.push(`--startup-widgets=${widgets.join(',')}`);
  if (argv.includes('--auto-start')) flags.push('--startup-auto-start');
  if (argv.includes('--auto-flood')) flags.push('--startup-auto-flood');
  if (createAutomationFlags(ROTP_AUTOMATION_FLAGS).isHeadlessLaunch(argv) && !argv.includes('--sound')) flags.push('--startup-muted');
  return flags;
};

export { rotpRendererFlags };
