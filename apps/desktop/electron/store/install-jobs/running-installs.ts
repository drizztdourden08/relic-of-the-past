/* @layer electron-main @kind logic */
const runningInstalls = new Map<string, AbortController>();

export { runningInstalls };
