/* @layer renderer-hooks @kind logic */
const spriteNameFromUrl = (url: string): string => {
  const last = url.split('/').pop();
  return decodeURIComponent(last === undefined || last === '' ? 'sprite.zspr' : last);
};

export { spriteNameFromUrl };
