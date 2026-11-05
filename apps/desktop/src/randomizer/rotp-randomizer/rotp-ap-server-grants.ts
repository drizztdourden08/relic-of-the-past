/* @layer renderer-app @kind logic */
import type { PhysicalPlan } from '@rotp/randomizer';

const rotpApServerGrants = (plan: PhysicalPlan): string[] =>
  plan.entries.filter((entry) => entry.planClass === 'deliver').map((entry) => entry.location);

export { rotpApServerGrants };
