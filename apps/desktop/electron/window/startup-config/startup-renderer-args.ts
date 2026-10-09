/* @layer electron-main @kind logic */
import { isAutomationLaunch, parseInstanceConfig } from '../../instance';
import type { StartupConfig } from './startup-config.type';

const startupRendererArgs = (config: StartupConfig): string[] => {
  const args: string[] = [];
  if (config.fresh) args.push('--startup-fresh');
  if (config.widgets.length > 0) args.push(`--startup-widgets=${config.widgets.join(',')}`);
  if (process.argv.includes('--muted')) args.push('--startup-muted');
  if (process.argv.includes('--sound')) args.push('--startup-sound');
  if (process.argv.includes('--auto-start')) args.push('--startup-auto-start');
  const instance = parseInstanceConfig();
  if (instance.name) args.push(`--startup-instance=${instance.name}`);
  if (instance.profile) args.push(`--startup-profile=${instance.profile}`);
  if (isAutomationLaunch()) args.push('--startup-automation');
  return args;
};

export { startupRendererArgs };
