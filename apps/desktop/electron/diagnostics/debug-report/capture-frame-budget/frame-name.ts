/* @layer electron-main @kind logic */
const frameName = (index: number): string => `frame_${String(index + 1).padStart(4, '0')}.png`;

export { frameName };
