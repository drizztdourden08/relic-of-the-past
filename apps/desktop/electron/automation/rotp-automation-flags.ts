/* @layer electron-main @kind logic */
import { createAutomationFlags } from '@drizztdourden08/brock-core';
import { ROTP_AUTOMATION_FLAGS } from './automation-flags.constants';

const rotpAutomationFlags = createAutomationFlags(ROTP_AUTOMATION_FLAGS);

export { rotpAutomationFlags };
