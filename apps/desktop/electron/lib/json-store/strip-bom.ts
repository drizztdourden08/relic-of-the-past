/* @layer electron-main @kind logic */
const stripBom = (text: string): string => (text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);

export { stripBom };
