/* @layer shared-asset-extraction @kind logic */
import type { ExtractionStamp } from './extraction-stamp.type';

const parseExtractionStamp = (text: string | null | undefined): string | null => {
  if (text == null) return null;
  try {
    const parsed: unknown = JSON.parse(text);
    const version = (parsed as Partial<ExtractionStamp> | null)?.version;
    return typeof version === 'string' ? version : null;
  } catch {
    return null;
  }
};

export { parseExtractionStamp };
