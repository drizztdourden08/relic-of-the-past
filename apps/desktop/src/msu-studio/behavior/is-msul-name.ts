/* @layer renderer-components @kind logic */
const isMsulName = (fileName: string): boolean => /\.msul$/i.test(fileName);

export { isMsulName };
