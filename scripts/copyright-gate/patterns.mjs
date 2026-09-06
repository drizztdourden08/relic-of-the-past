/* @layer tooling-scripts @kind logic */
/**
 * Detection patterns for the copyright/media gate. Tune signal here.
 * This file lives under scripts/copyright-gate/, which the trademark rule skips,
 * so the terms below never flag the gate itself.
 */

// Media we never expect to add (the project ships no game assets).
const MEDIA_EXT = new Set([
  // images
  'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'tiff', 'tif', 'ico', 'icns', 'psd', 'svg',
  // audio / music
  'mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'opus', 'mid', 'midi', 'spc', 'brr', 'pcm', 'it', 'mod', 's3m', 'xm', 'msu',
  // video
  'mp4', 'mov', 'avi', 'mkv', 'webm',
  // fonts
  'ttf', 'otf', 'woff', 'woff2',
  // rom / extracted game data
  'sfc', 'smc', 'nes', 'gb', 'gbc', 'dat', 'srm', 'sav', 'sram', 'bin',
]);

// High-signal Nintendo / ALttP trademarks (matched in ADDED lines only).
const TRADEMARK_RE = /\b(nintendo|the legend of zelda|a link to the past|hyrule|hylian|ganon(dorf)?|triforce|master sword|sheikah|sahasrahla|zelda)\b/i;

// Paths where these names legitimately appear, so the trademark rule skips them.
//
// `shared/game/data/records/` is the transcribed dataset (checks, actors, screens,
// dungeons, ...) moved back out of the private vault: it's data naming things, not
// code, so it's exempt the same way `shared/input/data/` is. Scoped to `records/`
// specifically, not all of `shared/game/data/`, so a trademark landing in a sibling
// schema, aggregator or facade file next to it still gets caught.
const TEXT_SKIP_PREFIXES = [
  'docs/', 'shared/input/data/', 'shared/game/data/records/',
  'scripts/copyright-gate/', '.github/', '.githooks/',
];
// Files whose whole point is to NAME the rights holder. This is nominative use, and removing
// the trademark would make the text meaningless, so the gate must not block edits
// to them.
const TEXT_SKIP_EXACT = new Set([
  'shared/credits.ts',
  'LICENSE',
  'apps/web/src/ui/domains/app/views/About/About.tsx',
]);

// When false, trademark hits warn instead of block (media files always block).
const TEXT_RULE_BLOCKS = true;

// Owner-approval signals.
const ALLOW_MARKER = '[allow-copyright]'; // in a commit message
const PR_LABEL = 'copyright-ok'; // on a pull request (maintainer-only)

export {
  MEDIA_EXT,
  TRADEMARK_RE,
  TEXT_SKIP_PREFIXES,
  TEXT_SKIP_EXACT,
  TEXT_RULE_BLOCKS,
  ALLOW_MARKER,
  PR_LABEL,
};
