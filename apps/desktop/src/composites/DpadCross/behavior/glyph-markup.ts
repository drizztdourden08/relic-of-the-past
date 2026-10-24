/* @layer renderer-components @kind logic */
const glyphMarkup = (entry: string | { body: string }): string => (typeof entry === 'string' ? entry : entry.body);

export { glyphMarkup };
