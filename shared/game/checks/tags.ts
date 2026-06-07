/* @layer shared-game @kind logic */
/**
 * Tag system for checks — enables filtering, searching, and grouping.
 *
 * Tags are assigned via rules (by type, screen patterns, dungeon, etc.) rather
 * than manually on each check. Definitions + rules live in tag-rules.ts; types
 * in tags-types.ts. This module computes tags for a check + caches them.
 */
import type { CheckTag, TagDefinition } from './tags-types';
import type { CheckDefinition } from '../types';
import { TAG_DEFINITIONS, DUNGEON_TAG_MAP, LIGHT_WORLD_DUNGEONS, CAVE_SCREENS, HOUSE_SCREENS, AREA_RULES } from './tag-rules';

const computeCheckTags = (check: CheckDefinition): CheckTag[] => {
  const tags: Set<CheckTag> = new Set();

  // ── World tag ──
  if (check.dungeon) {
    if (LIGHT_WORLD_DUNGEONS.has(check.dungeon)) {
      tags.add('light_world');
    } else {
      tags.add('dark_world');
    }
    tags.add('dungeon');
    const dungTag = DUNGEON_TAG_MAP[check.dungeon];
    if (dungTag) tags.add(dungTag);
  } else {
    // Overworld check — determine world from screen/id
    const isDark = /Dark|Catfish|Stumpy|Pyramid|Hype Cave|Brewery|C-Shaped|Chest Game|Bumper|Mire|Superbunny|Hookshot Cave|Frog|Missing Smith|Hammer Peg/.test(check.screen) ||
      /Dark|Catfish|Stumpy|Pyramid|Digging Game|Bombos Tablet|Frog|Missing Smith/.test(check.id);
    tags.add(isDark ? 'dark_world' : 'light_world');
  }

  // ── Location type (for non-dungeon checks) ──
  if (!check.dungeon) {
    if (CAVE_SCREENS.has(check.screen)) {
      tags.add('cave');
    } else if (HOUSE_SCREENS.has(check.screen)) {
      tags.add('house');
    } else {
      tags.add('overworld');
    }
  }

  // ── Geographic area ──
  if (!check.dungeon) {
    for (const rule of AREA_RULES) {
      if (rule.pattern instanceof Set) {
        if (rule.pattern.has(check.screen)) {
          tags.add(rule.tag);
          break;
        }
      } else {
        if (rule.pattern.test(check.screen) || rule.pattern.test(check.id)) {
          tags.add(rule.tag);
          break;
        }
      }
    }
  }

  // ── Content tags ──
  if (check.type === 'keyDrop') {
    tags.add('key');
    const items = Array.isArray(check.vanillaItem) ? check.vanillaItem : check.vanillaItem ? [check.vanillaItem] : [];
    if (items.some(i => i.startsWith('Big Key'))) tags.add('big_key');
  }
  if (check.type === 'boss') tags.add('boss_item');
  if (check.type === 'prize') tags.add('boss_item');
  if (check.vanillaItem) {
    const items = Array.isArray(check.vanillaItem) ? check.vanillaItem : [check.vanillaItem];
    for (const vi of items) {
      if (vi.startsWith('Small Key')) tags.add('key');
      if (vi.startsWith('Big Key')) tags.add('big_key');
      if (vi === 'Compass' || vi === 'Map' || vi.startsWith('Compass') || vi.startsWith('Map')) tags.add('map_compass');
    }
  }

  // Name-based content hints
  const name = check.name.toLowerCase();
  if (name.includes('map chest') || name.includes('compass chest')) tags.add('map_compass');
  if (name.includes('big key chest')) tags.add('big_key');

  return [...tags];
};

// ─── Pre-computed tag lookup ───
let _tagCache: Map<string, CheckTag[]> | null = null;

const getCheckTags = (checks: CheckDefinition[]): Map<string, CheckTag[]> => {
  if (_tagCache) return _tagCache;
  _tagCache = new Map();
  for (const check of checks) {
    _tagCache.set(check.id, computeCheckTags(check));
  }
  return _tagCache;
};

const getTagsForCheck = (checkId: string, allChecks: CheckDefinition[]): CheckTag[] => {
  return getCheckTags(allChecks).get(checkId) ?? [];
};

export { TAG_DEFINITIONS, computeCheckTags, getCheckTags, getTagsForCheck };
export type { CheckTag, TagDefinition } from './tags-types';
