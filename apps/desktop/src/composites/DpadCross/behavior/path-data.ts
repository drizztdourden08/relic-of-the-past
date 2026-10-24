/* @layer renderer-components @kind logic */
import { ACCENT_CLASS, PATH_DATA, PATH_TAG } from './glyph-path.constants';

const pathData = (markup: string, accent: boolean): string => {
  const tag = markup.match(PATH_TAG)?.find((candidate) => candidate.includes(ACCENT_CLASS) === accent);
  return tag?.match(PATH_DATA)?.[1] ?? '';
};

export { pathData };
