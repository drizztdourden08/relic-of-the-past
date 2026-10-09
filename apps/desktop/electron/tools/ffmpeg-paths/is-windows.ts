/* @layer electron-main @kind logic */
const isWindows = (): boolean => process.platform === 'win32';

export { isWindows };
