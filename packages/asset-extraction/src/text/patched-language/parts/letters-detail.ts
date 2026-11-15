/* @layer shared-asset-extraction @kind logic */
import { UNKNOWN_SHARE_WARNING } from './parts.constants';
import type { LettersSummary } from './parts.type';

const mostlyUnknown = (summary: LettersSummary): boolean =>
  summary.used > 0 && summary.unknown.length / summary.used > UNKNOWN_SHARE_WARNING;

const warningText = (summary: LettersSummary): string =>
  `Most letters still need naming: ${summary.unknown.length} of ${summary.used} letters the text uses were not recognised. `
  + 'Name them in the Studio under Name the letters.';

const matchedText = (summary: LettersSummary): string =>
  summary.matched.length > 0 ? `${summary.matched.length} new letters matched to known fonts (${summary.matched.join(' ')}).` : '';

const builtText = (summary: LettersSummary): string => {
  if (summary.built.length === 0) return '';
  const letters = summary.built.map((naming) => `${naming.token} (${naming.detail})`).join(', ');
  return `${summary.built.length} letters built from a known letter and a mark: ${letters}.`;
};

const unknownText = (summary: LettersSummary): string =>
  summary.unknown.length > 0 ? `${summary.unknown.length} glyphs not recognised, shown as ${summary.unknown.join(' ')}.` : '';

const lettersDetail = (summary: LettersSummary): string => {
  const parts = [matchedText(summary), builtText(summary), unknownText(summary)];
  if (mostlyUnknown(summary)) parts.unshift(warningText(summary));
  return parts.filter((part) => part.length > 0).join(' ');
};

export { lettersDetail };
