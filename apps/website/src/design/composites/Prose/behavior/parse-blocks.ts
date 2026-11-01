/* @layer website-site @kind logic */
import { COMMENT_PATTERN, HEADING_PATTERN, LIST_PATTERN } from '../Prose.constants';
import type { ProseBlock } from '../Prose.type';

const headingOf = (line: string): ProseBlock | null => {
  const match = HEADING_PATTERN.exec(line);
  return match ? { kind: 'heading', level: match[1]?.length ?? 1, text: match[2] ?? '' } : null;
};

const appendItem = (blocks: ProseBlock[], item: string): void => {
  const last = blocks.at(-1);
  if (last?.kind === 'list') last.items.push(item);
  else blocks.push({ kind: 'list', items: [item] });
};

const appendText = (blocks: ProseBlock[], line: string, open: boolean): void => {
  const last = blocks.at(-1);
  if (open && last?.kind === 'paragraph') last.text = `${last.text} ${line}`;
  else blocks.push({ kind: 'paragraph', text: line });
};

const pushBlock = (blocks: ProseBlock[], line: string, open: boolean): boolean => {
  const heading = headingOf(line);
  const item = LIST_PATTERN.exec(line)?.[1];
  if (heading) blocks.push(heading);
  else if (item !== undefined) appendItem(blocks, item);
  else appendText(blocks, line, open);
  return !heading && item === undefined;
};

const parseBlocks = (source: string): ProseBlock[] => {
  const blocks: ProseBlock[] = [];
  let open = false;

  source.split(/\r?\n/).forEach((raw) => {
    const line = raw.trim();
    open = line === '' || COMMENT_PATTERN.test(line) ? false : pushBlock(blocks, line, open);
  });
  return blocks;
};

export { parseBlocks };
