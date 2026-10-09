/* @layer renderer-lib @kind logic */
const isAutomationLaunch = (): boolean => window.api.startup.automation;

export { isAutomationLaunch };
