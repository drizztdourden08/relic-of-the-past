/* @layer electron-main @kind logic */
import { createAutomationFlags } from '@drizztdourden08/brock-core';
import { FORWARDED_VALUE_FLAGS, ROTP_AUTOMATION_FLAGS } from './automation-flags.constants';

const forwardedValueFlags = (argv: readonly string[]): string[] => {
  const flags = createAutomationFlags(ROTP_AUTOMATION_FLAGS);
  return FORWARDED_VALUE_FLAGS.flatMap((name) => {
    const value = flags.flagValue(`--${name}`, argv);
    return value ? [`--startup-${name}=${value}`] : [];
  });
};

export { forwardedValueFlags };
