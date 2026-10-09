/* @layer renderer-components @kind logic */
const ceilingNote = (walletTop: number, silverTop: number, hits: number): string =>
  `Capped by the seed's biggest wallet: ${walletTop} rupees, silver ${silverTop} so the final fight's `
  + `${hits} shots fit.`;

export { ceilingNote };
