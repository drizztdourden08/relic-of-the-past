/* @layer renderer-lib @kind logic */
const startJoystickCapture = (joystickId: number): Promise<boolean> =>
  window.api.startJoystickCapture(joystickId);

export { startJoystickCapture };
