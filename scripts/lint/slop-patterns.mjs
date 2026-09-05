/**
 * @layer tooling-scripts
 * @kind config
 *
 * The one source of truth for the AI-writing patterns this repo blocks.
 * Read by the local ESLint rules (eslint.config.mjs), the markdownlint custom
 * rules (scripts/lint/markdown-rules/) and the analyze harness adapter
 * (scripts/analyze/adapters/slop-adapter.mjs).
 *
 * Each entry carries the advice that goes into the lint message, so a report
 * always says what to write, not only what is banned.
 *
 * This file spells the banned words out on purpose. eslint.config.mjs switches
 * the three local rules off for scripts/lint/** for that reason.
 */

const w = (words) => new RegExp(`\\b(?:${words})\\b`, 'gi');

const SLOP_WORDS = [
  'delve|delving|leverage|leverages|leveraging|utilize|utilizes|utilizing|facilitate|facilitates',
  'elucidate|embark|endeavor|encompass|encompasses|multifaceted|tapestry|testament|paradigm|synergy',
  'holistic|catalyze|juxtapose|realm|myriad|plethora|galvanize|epitomize|supercharge|spearhead',
  'conceptualize|robust|robustly|robustness|comprehensive|comprehensively|seamless|cutting-edge',
  'innovative|streamline|streamlined|streamlines|empower|empowers|foster|fosters|fostering',
  'elevate|elevates|pivotal|intricate|intricacies|profound|resonate|resonates|cultivate|bolster',
  'bolsters|cornerstone|game-changer|game-changing|groundbreaking|transformative|unprecedented',
  'compelling|ever-evolving|meticulous|versatile|bespoke|unwavering|vibrant|unleash|unveil',
  'captivate|revolutionize|amplify|illuminate|discern|crucial|crucially|vital|paramount|pragmatic',
  'foundational|strategic|straightforward|nuanced|nuance|showcase|showcases|showcasing|garner',
  'interplay|enduring|actionable|enhance|enhances|enhanced|enhancing|optimal|optimally',
].join('|');

const FILLER_ADVERBS = [
  'genuinely|quietly|simply|essentially|fundamentally|importantly|ultimately|notably|arguably',
  'indeed|truly|seamlessly|meticulously|effortlessly|elegantly|gracefully|beautifully|cleanly',
].join('|');

const STOCK_PHRASES = [
  "it(?:'s| is) worth noting|it (?:is|should be) (?:important|noted|worth)(?: to note)?",
  'keep in mind|in order to|at the end of the day|the key is|dive into|deep dive',
  "here's the thing|a testament to|moving forward|going forward|as well as|in this case,",
  'this means that|this ensures|which means that|make sure to|be sure to|feel free to',
  "worth mentioning|in today's|in a world where|when it comes to|the beauty of|it's important to",
  'plays? a (?:crucial|vital|key|pivotal) role',
].join('|');

const CONNECTORS = [
  'Furthermore|Moreover|Additionally|Consequently|Nevertheless|That said|In other words',
  'In conclusion|Overall|Importantly|Crucially|Note that|Notably|Ultimately|Essentially|Interestingly',
].join('|');

// group decides which rule reports the hit:
//   dash  -> local/no-em-dash          punct -> local/no-smart-punctuation
//   prose -> local/no-slop-prose
// `word: true`  runs the identifier guard (ensureWasm, ensure-wasm, obj.ensure()).
// `prefix: true` means group 1 is the lead-in and group 2 is the reported text.
const PATTERNS = [
  {
    id: 'em-dash',
    group: 'dash',
    re: /[—–]/g,
    label: (d) => (d === '—' ? 'Em dash' : 'En dash'),
    advice:
      'REPHRASE the sentence. Do not swap the character: a colon, a comma or a spaced hyphen keeps the same clause-plus-aside shape, and that shape is the tell. Split it into two sentences, delete the aside, or rejoin it with because / so / when / which. A numeric range or a table separator takes a plain hyphen.',
  },
  {
    id: 'ellipsis',
    group: 'punct',
    re: /…/g,
    label: 'Unicode ellipsis',
    advice: 'Type three periods (...) in a UI label. In prose, end the sentence and drop it.',
  },
  {
    id: 'curly-quote',
    group: 'punct',
    re: /[‘’“”]/g,
    label: 'Curly quote',
    advice: 'Use the straight quotes \' and ". Escape them in a string if needed.',
  },
  {
    id: 'rather-than',
    group: 'prose',
    re: /\brather than\b/gi,
    advice: 'Write "instead of", or turn the sentence around: "X, not Y".',
  },
  {
    id: 'neg-pivot',
    group: 'prose',
    re: /\b(?:not|isn't|aren't|wasn't|doesn't|don't|never)\s+(?:just|only|merely|simply)\b[^.\n]{0,80}?\b(?:but|it's|it is|they're|rather)\b/gi,
    advice: 'Drop the pivot and say the thing once: "X and Y", or just "Y".',
  },
  {
    id: 'neg-pivot',
    group: 'prose',
    re: /\bit(?:'s| is)\s+not\s+(?:about|a|an|the)?\s?[^.\n,]{1,40},\s*(?:it(?:'s| is)|but)\b/gi,
    advice: 'Drop the pivot and say the thing once.',
  },
  {
    id: 'connector',
    group: 'prose',
    prefix: true,
    re: new RegExp(`(^|[.!?]\\s+|^[ \\t]*(?:\\/\\/|#|--|>|[-+*])[ \\t]*)(${CONNECTORS})\\b[,:]?`, 'gm'),
    advice: 'Delete the opening connector, or use "Also". The sentence reads fine without it.',
  },
  {
    id: 'stock-phrase',
    group: 'prose',
    re: new RegExp(`\\b(?:${STOCK_PHRASES})(?![\\w-])`, 'gi'),
    advice:
      'Use plain words: "to" for "in order to", "and" for "as well as", "so" for "this means that", "make sure" for "make sure to". Or delete the phrase.',
  },
  {
    id: 'slop-word',
    group: 'prose',
    word: true,
    re: w(SLOP_WORDS),
    advice: 'Use a plain word (use, solid, key, full, simplify, improve, best, simple, needed), or delete it.',
  },
  {
    id: 'filler-adverb',
    group: 'prose',
    word: true,
    re: w(FILLER_ADVERBS),
    advice: 'Delete the adverb. It adds nothing the sentence does not already say.',
  },
  {
    id: 'ensure',
    group: 'prose',
    word: true,
    re: w('ensure|ensures|ensuring'),
    advice: 'Write "make sure", "check" or "guarantee". Identifiers such as ensureWasm or ensure-wasm are left alone.',
  },
];

// Domain terms this repo uses for real. An entry with an uppercase letter matches
// case-sensitively, so `Enhanced` (a UI setting name) passes and "enhanced
// performance" in prose still fails.
// Domain words this project uses literally, so the prose rules skip them.
// `enhanced` names a real feature (the enhanced HUD overlay and the
// `hudMode: 'original' | 'enhanced'` setting), not a vague quality claim.
const DEFAULT_ALLOW = [
  'navigate', 'navigates', 'navigating', 'navigation',
  'harness', 'harnesses',
  'unlock', 'unlocks', 'unlocked', 'unlocking',
  'underscore', 'underscores',
  'enhanced',
];

const RULE_BY_GROUP = { dash: 'no-em-dash', punct: 'no-smart-punctuation', prose: 'no-slop-prose' };
const GROUPS = ['dash', 'punct', 'prose'];

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const compileAllow = (allow) =>
  allow.map((a) => new RegExp(`^(?:${escapeRe(a)})$`, /[A-Z]/.test(a) ? '' : 'i'));

const isIdentChar = (c) => c !== undefined && /[A-Za-z0-9_$-]/.test(c);

// Skip anything that is part of a name rather than a word in a sentence:
// ensure-wasm, ENSURE_OK, obj.ensure(), $enhanced.
const isIdentifierUse = (text, index, length) => {
  const before = text[index - 1];
  const after = text[index + length];
  if (isIdentChar(before) || isIdentChar(after)) return true;
  if (after === '(') return true;
  if (before === '.' && /[A-Za-z0-9_$]/.test(text[index - 2] ?? '')) return true;
  return false;
};

/**
 * Find every banned pattern in `text`.
 * @param {string} text
 * @param {{ allow?: string[], groups?: string[] }} [opts]
 * @returns {{ id: string, group: string, index: number, length: number, match: string, message: string }[]}
 *   Sorted by index, with overlapping hits collapsed to the longest one.
 */
const findSlop = (text, opts = {}) => {
  const allow = compileAllow(opts.allow ?? DEFAULT_ALLOW);
  const groups = opts.groups ?? GROUPS;
  const found = [];
  for (const p of PATTERNS) {
    if (!groups.includes(p.group)) continue;
    p.re.lastIndex = 0;
    let m;
    while ((m = p.re.exec(text)) !== null) {
      if (m[0].length === 0) { p.re.lastIndex++; continue; }
      const match = p.prefix ? m[2] : m[0];
      const index = p.prefix ? m.index + m[1].length : m.index;
      if (p.word && isIdentifierUse(text, index, match.length)) continue;
      if (allow.some((re) => re.test(match))) continue;
      const label = typeof p.label === 'function' ? p.label(match) : p.label;
      const head = label ?? `"${match.replace(/\s+/g, ' ')}"`;
      found.push({ id: p.id, group: p.group, index, length: match.length, match, message: `${head}: ${p.advice}` });
    }
  }
  found.sort((a, b) => a.index - b.index || b.length - a.length);
  const out = [];
  let end = -1;
  for (const f of found) {
    if (f.index < end) continue;
    out.push(f);
    end = f.index + f.length;
  }
  return out;
};

export { PATTERNS, DEFAULT_ALLOW, RULE_BY_GROUP, GROUPS, findSlop };
