/* @layer renderer-app @kind constants */

/** A single token chip: display name, CSS var, literal value, optional note. */
interface TokenSpec {
  name: string;
  cssVar: string;
  value: string;
  note?: string;
}

interface TokenGroup {
  title: string;
  description?: string;
  tokens: TokenSpec[];
}

const SURFACES: TokenGroup = {
  title: 'Surfaces (one background family)',
  description: 'Depth comes from borders + shadow, not from many background hues.',
  tokens: [
    { name: 'bg', cssVar: '--c-bg', value: '#0e0e12', note: 'canvas · pages · panels · docked widgets' },
    { name: 'surface', cssVar: '--c-surface', value: '#17171d', note: 'cards · inputs · dialogs · popovers' },
    { name: 'sunken', cssVar: '--c-sunken', value: '#08080b', note: 'wells · code · deep insets' },
    { name: 'glass', cssVar: '--c-glass', value: 'rgb(14 14 18 / .92)', note: 'floating over the game (+ blur)' },
  ],
};

const BORDERS: TokenGroup = {
  title: 'Borders & state fills',
  tokens: [
    { name: 'border', cssVar: '--c-border', value: '#2a2a32', note: 'hairline default' },
    { name: 'border-strong', cssVar: '--c-border-strong', value: '#3c3c46', note: 'hover / emphasis' },
    { name: 'hover', cssVar: '--c-hover', value: 'white 5%', note: 'neutral hover fill' },
    { name: 'selected', cssVar: '--c-selected', value: 'gold 12%', note: 'selected / active fill (GOLD)' },
  ],
};

const TEXT: TokenGroup = {
  title: 'Text',
  tokens: [
    { name: 'text', cssVar: '--c-text', value: '#e8e8ec', note: 'primary' },
    { name: 'text-dim', cssVar: '--c-text-dim', value: '#9a9aa4', note: 'secondary' },
    { name: 'text-muted', cssVar: '--c-text-muted', value: '#5e5e68', note: 'meta / ids' },
    { name: 'text-faint', cssVar: '--c-text-faint', value: '#3c3c44', note: 'disabled' },
  ],
};

const GOLD: TokenGroup = {
  title: 'Gold (PRIMARY accent)',
  description: 'Selection · active · focus · the primary action · highlights. The default "this matters".',
  tokens: [
    { name: 'gold', cssVar: '--c-gold', value: '#c8a84e' },
    { name: 'gold-bright', cssVar: '--c-gold-bright', value: '#e4c65a' },
    { name: 'gold-dim', cssVar: '--c-gold-dim', value: '#2a2418', note: 'dim fill bg' },
    { name: 'gold-soft', cssVar: '--c-gold-soft', value: 'gold 14%', note: 'glow / selected' },
  ],
};

const GREEN: TokenGroup = {
  title: 'Green (SECONDARY accent, contextual)',
  description: 'Positive / success / go ONLY: success, complete/obtained, live/connected, safe actions (Start, Resume, Connect). Never plain "selected".',
  tokens: [
    { name: 'green', cssVar: '--c-green', value: '#4a9966' },
    { name: 'green-bright', cssVar: '--c-green-bright', value: '#5cb87a' },
    { name: 'green-dim', cssVar: '--c-green-dim', value: '#1a2a1e' },
    { name: 'green-soft', cssVar: '--c-green-soft', value: 'green 14%' },
  ],
};

const SEMANTIC: TokenGroup = {
  title: 'Semantics',
  tokens: [
    { name: 'danger', cssVar: '--c-danger', value: '#e5556e', note: 'destructive / error' },
    { name: 'warning', cssVar: '--c-warning', value: '#e0b341', note: 'warning / pending' },
    { name: 'info', cssVar: '--c-info', value: '#5b9bd5', note: 'info TEXT/icon only' },
    { name: 'scrim', cssVar: '--c-scrim', value: 'black 60%', note: 'modal backdrop' },
  ],
};

const COLOR_GROUPS: TokenGroup[] = [SURFACES, BORDERS, TEXT, GOLD, GREEN, SEMANTIC];

const TYPE_SCALE: TokenSpec[] = [
  { name: 'xs', cssVar: '--text-xs', value: '10px' },
  { name: 'sm', cssVar: '--text-sm', value: '11px' },
  { name: 'base', cssVar: '--text-base', value: '13px' },
  { name: 'lg', cssVar: '--text-lg', value: '16px' },
  { name: 'xl', cssVar: '--text-xl', value: '20px' },
];

const SPACE_SCALE: TokenSpec[] = [
  { name: '2xs', cssVar: '--space-2xs', value: '2px', note: 'caption to its control' },
  { name: 'xs', cssVar: '--space-xs', value: '4px' },
  { name: 'sm', cssVar: '--space-sm', value: '8px' },
  { name: 'md', cssVar: '--space-md', value: '12px' },
  { name: 'lg', cssVar: '--space-lg', value: '16px' },
  { name: 'xl', cssVar: '--space-xl', value: '24px' },
  { name: '2xl', cssVar: '--space-2xl', value: '32px' },
];

const RADIUS_SCALE: TokenSpec[] = [
  { name: 'sm', cssVar: '--r-sm', value: '4px' },
  { name: 'md', cssVar: '--r-md', value: '6px' },
  { name: 'lg', cssVar: '--r-lg', value: '8px' },
  { name: 'pill', cssVar: '--r-pill', value: '999px' },
];

const SHADOW_SCALE: TokenSpec[] = [
  { name: 'shadow-1', cssVar: '--shadow-1', value: '0 2 8' },
  { name: 'shadow-2', cssVar: '--shadow-2', value: '0 8 24' },
  { name: 'shadow-3', cssVar: '--shadow-3', value: '0 16 40' },
];

export type { TokenSpec, TokenGroup };
export { COLOR_GROUPS, TYPE_SCALE, SPACE_SCALE, RADIUS_SCALE, SHADOW_SCALE };
