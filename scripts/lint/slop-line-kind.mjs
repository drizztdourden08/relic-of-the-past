/**
 * @layer tooling-scripts
 * @kind logic
 *
 * Per-line comment/string classifier for the languages ESLint and markdownlint
 * do not cover (C, CSS, shell, YAML, batch, XML, JSON...). The AI-writing gate
 * uses it to decide where prose patterns apply: word patterns only inside
 * comments and string literals, character patterns anywhere.
 */

const SLASH = { line: '//', open: '/*', close: '*/' };
const HASH = { line: '#' };
const XML = { open: '<!--', close: '-->' };

const BY_LANG = {
  C: SLASH,
  'C-Header': SLASH,
  'C++': SLASH,
  CSS: { open: '/*', close: '*/' },
  SCSS: SLASH,
  Shell: HASH,
  YAML: HASH,
  TOML: HASH,
  Python: HASH,
  Make: HASH,
  PowerShell: { line: '#', open: '<#', close: '#>' },
  Batch: { line: '::' },
  HTML: XML,
  Other: XML,
  JSON: {},
};

const markersFor = (lang) => BY_LANG[lang] ?? {};

const startsComment = (trimmed, m) =>
  (m.line && trimmed.startsWith(m.line)) ||
  (m.open && trimmed.startsWith(m.open)) ||
  trimmed.startsWith('*') ||
  (m.line === '::' && /^rem\b/i.test(trimmed));

/**
 * Classify each line of `text` as 'comment' | 'string' | 'other'.
 * Block comments are tracked across lines; a line holding both code and a
 * trailing comment counts as a comment, which is deliberately generous.
 * @param {string} text
 * @param {string} lang analyze-harness language name
 * @returns {string[]} one kind per line
 */
const classifyLines = (text, lang) => {
  const m = markersFor(lang);
  const out = [];
  let inBlock = false;
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (inBlock) {
      out.push('comment');
      if (m.close && line.includes(m.close)) inBlock = false;
      continue;
    }
    if (m.open && line.includes(m.open) && !(m.close && line.includes(m.close))) {
      inBlock = true;
      out.push('comment');
      continue;
    }
    if (startsComment(trimmed, m)) { out.push('comment'); continue; }
    if (m.open && line.includes(m.open)) { out.push('comment'); continue; }
    if (m.line && line.includes(m.line) && !/["'`]/.test(line.slice(0, line.indexOf(m.line)))) {
      out.push('comment');
      continue;
    }
    out.push(/["'`]/.test(line) ? 'string' : 'other');
  }
  return out;
};

export { classifyLines };
