/* @layer renderer-lib @kind logic */
const rescanControllerDevices = (): Promise<void> => window.api.rescanControllers();

export { rescanControllerDevices };
