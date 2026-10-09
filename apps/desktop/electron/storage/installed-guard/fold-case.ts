/* @layer electron-main @kind logic */
const foldCase = (path: string): string => (process.platform === 'linux' ? path : path.toLowerCase());

export { foldCase };
