/* @layer bridge-wasm @kind logic */
/** The physical plan's one-line summary and every plan error, logged under the session's tag. */
import { log } from '../../log-bus';
import type { PhysicalPlan } from './physical-plan.type';

const logPlanSummary = (plan: PhysicalPlan, tag: string): void => {
  const { counts, errors } = plan;
  log.randomizer(`${tag} Plan summary: ${counts.override} overrides, ${counts.overrideNpc} npc overrides, `
    + `${counts.overrideDrop} drop overrides, ${counts.overrideStanding} standing overrides, `
    + `${counts.overrideScripted} scripted overrides, ${counts.overrideShop} shop overrides, `
    + `${counts.deliver} deliver, ${counts.vanillaLocked} vanilla-locked (${counts.pollBlind} poll-blind), `
    + `${counts.errors} errors`);
  for (const error of errors) {
    log.randomizer(`${tag} Plan error at "${error.location}" (${error.item}): ${error.reason}`, 'error');
  }
};

export { logPlanSummary };
