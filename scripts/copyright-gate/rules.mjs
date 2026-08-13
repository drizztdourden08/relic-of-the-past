/* @layer tooling-scripts @kind logic */
/** Detection rules (Strategy): each maps a change-set to findings. */
import { MEDIA_EXT, TRADEMARK_RE, TEXT_SKIP_PREFIXES, TEXT_SKIP_EXACT } from './patterns.mjs';

const extOf = (path) => {
  const base = path.slice(path.lastIndexOf('/') + 1);
  const dot = base.lastIndexOf('.');
  return dot > 0 ? base.slice(dot + 1).toLowerCase() : '';
};

const isTextSkipped = (path) =>
  extOf(path) === 'md'
  || TEXT_SKIP_EXACT.has(path)
  || TEXT_SKIP_PREFIXES.some((prefix) => path.startsWith(prefix));

// Any added/modified media file (the project ships no game assets).
const mediaRule = (changes) =>
  changes.files
    .filter((file) => MEDIA_EXT.has(extOf(file)))
    .map((file) => ({
      rule: 'media',
      severity: 'block',
      file,
      hint: "media file (image/audio/video/font/rom) — needs the 'copyright-ok' label",
    }));

// Nintendo / ALttP references introduced in added text lines.
const trademarkRule = (changes) =>
  Object.entries(changes.addedLines)
    .filter(([file]) => !isTextSkipped(file))
    .flatMap(([file, lines]) =>
      lines
        .filter((line) => TRADEMARK_RE.test(line.text))
        .map((line) => ({
          rule: 'trademark',
          severity: 'text',
          file,
          line: line.n,
          match: line.text.match(TRADEMARK_RE)[0],
          hint: "Nintendo reference in added line — reword it, or label the PR 'copyright-ok'",
        })));

const RULES = [mediaRule, trademarkRule];

export { RULES, extOf, isTextSkipped };
