/* @layer renderer-lib @kind logic */
const releaseHold = (): Promise<boolean> => window.api.releaseControllerHold();

export { releaseHold };
