/* @layer renderer-lib @kind logic */
const restoreHold = (): Promise<boolean> => window.api.restoreControllerHold();

export { restoreHold };
