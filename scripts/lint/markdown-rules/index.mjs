/**
 * @layer tooling-scripts
 * @kind logic
 *
 * markdownlint custom rules for the AI-writing gate. Same patterns the local
 * ESLint rules apply to TS/JS, run over Markdown prose.
 *
 * Wired up by `customRules` in .markdownlint-cli2.jsonc. Code fences, indented
 * code blocks and inline code spans are masked out first, so a sample command
 * such as `npm run ensure-wasm` is left alone.
 *
 * Disable one line with an HTML comment:
 *   <!-- markdownlint-disable-next-line no-em-dash -->
 * Per-file or per-config allowlist entries go in `config` under the rule name:
 *   "no-slop-prose": { "allow": ["Enhanced", "harness"] }
 */
import { DEFAULT_ALLOW, findSlop } from '../slop-patterns.mjs';

const FENCE = /^\s{0,3}(`{3,}|~{3,})/;
const INLINE_CODE = /`+[^`]*`+/g;
const blank = (m) => ' '.repeat(m.length);

// Replace code with spaces so column numbers still line up with the source.
const maskCode = (lines) => {
  let fence = null;
  return lines.map((line) => {
    const open = line.match(FENCE);
    if (fence) {
      if (open && open[1][0] === fence[0] && open[1].length >= fence.length) fence = null;
      return blank(line);
    }
    if (open) { fence = open[1]; return blank(line); }
    if (/^ {4,}\S/.test(line)) return blank(line); // indented code block
    return line.replace(INLINE_CODE, blank);
  });
};

const makeRule = (id, name, group, description) => ({
  names: [id, name],
  description,
  tags: ['prose', 'style', 'rotp'],
  parser: 'none',
  function: (params, onError) => {
    const allow = params.config?.allow ?? DEFAULT_ALLOW;
    const lines = maskCode(params.lines);
    lines.forEach((line, i) => {
      for (const hit of findSlop(line, { allow, groups: [group] })) {
        onError({
          lineNumber: i + 1,
          detail: hit.message,
          context: hit.match.replace(/\s+/g, ' ').slice(0, 40),
          range: [hit.index + 1, hit.length],
        });
      }
    });
  },
});

const rules = [
  makeRule('ROTP001', 'no-em-dash', 'dash', 'Em dash or en dash in prose; rewrite the sentence, do not swap the character'),
  makeRule('ROTP002', 'no-smart-punctuation', 'punct', 'Unicode ellipsis or curly quote in prose; use plain ASCII punctuation'),
  makeRule('ROTP003', 'no-slop-prose', 'prose', 'AI-writing pattern in prose; use plain words and short sentences'),
];

export default rules;
