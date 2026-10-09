/* @layer electron-main @kind logic */
const isUpdateHarness = (): boolean => !!process.env.ROTP_UPDATE_API_ORIGIN;

export { isUpdateHarness };
