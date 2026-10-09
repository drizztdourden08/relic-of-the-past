/* @layer renderer-components @kind logic */
import { extensionOf } from './extension-of';
import { stemOf } from './stem-of';

const uniqueFileName = (fileName: string, taken: Set<string>): string => {
  if (!taken.has(fileName)) return fileName;
  const stem = stemOf(fileName);
  const ext = extensionOf(fileName);
  for (let n = 2; n < 1000; n += 1) {
    const candidate = `${stem} (${n}).${ext}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${stem}-${Date.now()}.${ext}`;
};

export { uniqueFileName };
