/* @layer renderer-lib @kind logic */
/**
 * The debug-info block is built as titled sections so a formatter can drop a line
 * (or a whole section) when the underlying probe returned nothing, without the
 * caller having to know which parts are optional.
 */

interface DebugSection {
  title: string;
  lines: string[];
}

type Line = string | null | false | undefined;

const section = (title: string, lines: Line[]): DebugSection => ({
  title,
  lines: lines.filter((line): line is string => typeof line === 'string' && line.length > 0),
});

const renderSections = (sections: DebugSection[]): string =>
  sections
    .filter((entry) => entry.lines.length > 0)
    .map((entry) => [`[${entry.title}]`, ...entry.lines].join('\n'))
    .join('\n\n');

export { section, renderSections };
export type { DebugSection, Line };
