/* @layer renderer-lib @kind logic */
const stopJoystickCapture = (): Promise<void> => window.api.stopJoystickCapture();

export { stopJoystickCapture };
