/* @layer renderer-components @kind logic */
/**
 * Which bracket names this language spells a PICTURE CHARACTER with, as a
 * membership set the inline chip can ask.
 *
 * A picture character and a control code are spelled identically — a bare
 * bracket run — and both round-trip as paramless `cmd` tokens, so telling them
 * apart needs the language's own alphabet. That discovery rule already lives in
 * `insert-menu.model`, and this reads its ANSWER back out of the built groups
 * rather than repeating the rule: the icons cluster is exactly the set of
 * bracket names the alphabet carries as characters.
 */
import type { ToolbarGroup } from './editor-ui.type';

const GLYPH_ID = /^glyph-(.+)$/;

const glyphNamesFrom = (groups: ToolbarGroup[]): Set<string> => {
  const names = new Set<string>();
  for (const group of groups) {
    for (const item of group.items) {
      const name = GLYPH_ID.exec(item.id)?.[1];
      if (name) names.add(name);
    }
  }
  return names;
};

export { glyphNamesFrom };
