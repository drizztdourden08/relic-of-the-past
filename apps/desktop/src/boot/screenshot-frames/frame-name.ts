/* @layer renderer-app @kind logic */
const frameName = (name: string, index: number): string => `${name}-${String(index).padStart(2, '0')}`;

export { frameName };
