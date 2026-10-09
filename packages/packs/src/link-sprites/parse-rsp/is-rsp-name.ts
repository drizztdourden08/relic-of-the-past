/* @layer shared-storage @kind logic */
const isRspName = (name: string): boolean => /\.rsp$/i.test(name);

export { isRspName };
