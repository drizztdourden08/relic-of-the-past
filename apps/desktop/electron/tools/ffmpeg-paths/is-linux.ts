/* @layer electron-main @kind logic */
const isLinux = (): boolean => process.platform === 'linux';

export { isLinux };
