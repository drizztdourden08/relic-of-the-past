/* @layer renderer-lib @kind logic */
const stopRawCapture = (): Promise<void> => window.api.stopControllerRawCapture();

export { stopRawCapture };
