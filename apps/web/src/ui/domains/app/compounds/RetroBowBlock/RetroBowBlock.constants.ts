/* @layer renderer-components @kind data */
/**
 * Fixed copy for the retro-bow block: the title, the switch's own label, the
 * reason the plain cost can go inert, and the one-line readout of where the
 * two cost sliders stop.
 */

const RETRO_TITLE = 'Retro bow';

const RETRO_SWITCH_LABEL = 'Pay rupees per shot instead of carrying arrows';

/** Rupee amounts a cost may stop on: round numbers a game of this age would ask. */
const RETRO_COST_STEP = 5;

/** Shown on the plain cost while the plain bow rung is unticked above. */
const NO_PLAIN_BOW_NOTE = 'No plain bow in this seed: the first bow found already fires silver';

/** Under the two sliders: the tops the player cannot read off the controls. */
const ceilingNote = (walletTop: number, silverTop: number, hits: number): string =>
  `Capped by the seed's biggest wallet: ${walletTop} rupees, silver ${silverTop} so the final fight's `
  + `${hits} shots fit.`;

export {
  NO_PLAIN_BOW_NOTE, RETRO_COST_STEP, RETRO_SWITCH_LABEL, RETRO_TITLE, ceilingNote,
};
